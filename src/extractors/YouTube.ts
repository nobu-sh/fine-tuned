import type { Readable } from 'stream';
import * as dl from 'play-dl';
import { YouTube as YTSR, SearchOptions, PlaylistOptions } from 'youtube-sr';
import { Extractor, ExtractorSearchOptions, ExtractorSearchResult } from './Extractor';
import { QueryType } from '../constants';
import { Playlist, Track } from '../structures';
import { isolate, Noop } from '../utils';

// taken from ytdl-core
const validQueryDomains = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'gaming.youtube.com']);
const validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const idRegex = /^[a-zA-Z0-9-_]{11}$/;

export class YouTube extends Extractor {
  /**
   * Identifier of the extractor.
   */
  public readonly id = 'ext:youtube-no-dl';

  /**
   * Handles the given query and *hopefully* returns a useful result.
   * @param query Query string.
   * @param opts Handling options.
   */
  public async handle(query: string, opts: ExtractorSearchOptions): Promise<ExtractorSearchResult> {
    return this[opts.type](query, opts);
  }

  /**
   * Takes the given track information and returns a readable stream.
   * @param info Track information.
   */
  public async stream(info: Track): Promise<Readable> {
    // Validate the url is a YouTube URL.
    if (!info.streamingURL)
      throw new Error('No URL provided for streaming.');
    if (!YouTube.validateURL(info.streamingURL))
      throw new Error('Invalid URL provided for streaming.');

    // get the dl stream
    const _s = await dl.stream(info.streamingURL, { discordPlayerCompatibility: true, quality: 2 });

    return _s.stream;
  }

  /**
   * Add the youtube playlist query handler.
   * @param query Query string to handle.
   * @param opts Query options
   * @returns 
   */
  public override async [QueryType.YOUTUBE_PLAYLIST](query: string, opts: ExtractorSearchOptions): Promise<ExtractorSearchResult> {
    // Configure playlist fetching options.
    let playListOptions: PlaylistOptions = {};
    // If there is a playlist limit, set it.
    if (opts.playlistLimit) playListOptions = {
      limit: opts.playlistLimit,
    };
    // Otherwise fetch all.
    else playListOptions = {
      fetchAll: true
    };

    // Fetch the playlist information from YouTube.
    const ytpl = await YTSR.getPlaylist(query, playListOptions)
      .catch(Noop);
    if (!ytpl) return this.emptyResult();

    // Convert the fetched playlist to a playlist structure.
    const playlist = Playlist.fromYTSR(ytpl, this, 'playlist');
        
    // Create a new response from the empty result structure.
    const response = this.emptyResult();
    response.playlist = playlist;
    response.tracks = playlist.tracks;

    return response;
  }

  /**
   * Add the youtube video query handler.
   * @param query Query string to handle.
   * @param opts Query options
   * @returns 
   */
  public override async [QueryType.YOUTUBE_VIDEO](query: string, opts: ExtractorSearchOptions): Promise<ExtractorSearchResult> {
    // Attempt to get the id from the query.
    const id = await isolate(() => YouTube.parseURL(query)).catch(Noop);
    if (!id) return this.emptyResult();
    // Attempt to get the video information from YouTube.
    const video = await YTSR.getVideo(`https://www.youtube.com/watch?v=${id}`).catch(Noop);
    if (!video) return this.emptyResult();

    // Convert the fetched video to a track structure.
    const track = Track.fromYTSR(video, this, opts.type);

    // Create a new response from the empty result structure.
    const response = this.emptyResult();
    response.tracks.push(track);

    return response;
  }

  /**
   * Add the youtube search query handler.
   * @param query Query string to handle.
   * @param opts Query options
   * @returns 
   */
  public override async [QueryType.YOUTUBE_SEARCH](query: string, opts: ExtractorSearchOptions): Promise<ExtractorSearchResult> {
    // Create a new response from the empty result structure.
    const response = this.emptyResult();
    response.tracks = await this._makeSearch(query, opts);

    return response;
  }

  /**
   * Makes a search on YouTube.
   * @param query Query string.
   * @param opts Search options.
   * @returns
   */
  private async _makeSearch(query: string, opts: ExtractorSearchOptions): Promise<Track[]> {
    // Make the search options.
    const searchOptions: SearchOptions & { type: 'video' } = {
      type: 'video',
    };

    // If there is a limit, set it.
    if (opts.limit) searchOptions.limit = opts.limit;

    // Fetch the search results.
    const res = await YTSR.search(query, searchOptions)
      .catch(Noop);

    // If there are no results, return an empty array.
    if (!res?.length) return [];

    // Return the results mapped into Track structure.
    return res.map((video) =>
      Track.fromYTSR(video, this, QueryType.YOUTUBE_SEARCH)
    );
  }

  /**
   * Validates the give string is a YouTube URL.
   * @param url String that is supposed to be a YouTube URL.
   * @returns 
   */
  public static validateURL(url: string): boolean {
    try {
      // Attempt to parse the URL.
      YouTube.parseURL(url);
      // If we make it this far the it sucessfully parsed.
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate the given string is a YouTube video ID.
   * @param id String that is supposed to be a YouTube video ID.
   * @returns 
   */
  public static validateId(id: string): boolean {
    return idRegex.test(id.trim());
  }

  /**
   * Parses the give string into a YouTube video ID.
   * @param _url String that is supposed to be a YouTube URL.
   * @returns 
   */
  public static parseURL(_url: string): string {
    // Map the given string into a URL object.
    const url = new URL(_url.trim());
    // Attempt to get the video ID from the URL search params.
    let id = url.searchParams.get('v');

    // If the video ID is not in the search params, attempt to get it from the URL path.
    if (validPathDomains.test(_url.trim()) && !id) {
      // Split the URL path into an array.
      const paths = url.pathname.split('/');
      // Based on the host name the video ID will be in a different index.
      id = url.host === 'youtu.be' ? paths[1] : paths[2];
    } else if (url.hostname && !validQueryDomains.has(url.hostname)) {
      // If the hostname is not a valid YouTube domain, throw an error.
      throw new Error('Not a valid YouTube URL.');
    }

    // If still no id is found, throw an error.
    if (!id) throw new Error(`No video id found in "${url.href}"`);

    // Extract the data we need from the id.
    id = id.substring(0, 11);

    // Validate the extracted ID.
    if (!YouTube.validateId(id)) 
      throw new Error(`Video id (${id}) does not match expected format (${idRegex.toString()})`);
  
    return id;
  }
}
