import type { Readable } from 'stream';
import * as dl from 'play-dl';
import { YouTube as YTSR } from 'youtube-sr';
import { Extractor, ExtractorSearchOptions, ExtractorSearchResult } from './Extractor';
import { YouTube } from './YouTube';
import { QueryType } from '../constants';
import { Playlist, Track } from '../structures';
import { Noop, QueryResolver } from '../utils';

export class Spotify extends Extractor {
  /**
   * Identifier of the extractor.
   */
  public readonly id = 'ext:spotify';

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
      info.streamingURL = await this.fetchStreamURL(info);
    if (!YouTube.validateURL(info.streamingURL))
      throw new Error('Invalid URL provided for streaming.');

    // get the dl stream
    const _s = await dl.stream(info.streamingURL, { discordPlayerCompatibility: true });

    return _s.stream;
  }

  /**
   * Dyanmically fetches the streaming URL to avoid ratelimits :P
   * @param info Track information. 
   * @returns 
   */
  public async fetchStreamURL(info: Track): Promise<string> {
    if (info.streamingURL) return info.streamingURL;
    // To save us from ratelimiting, we will get and set the streaming url here.
    const url = await YTSR.searchOne(`${info.title} ${info.author}`, 'video')
      .then(r => r.url)
      .catch(Noop);

    // If nore url then yeet.
    if (!url) throw new Error('Could not get stream for this track.');
    // Set the new streaming url dynamically.
    info.streamingURL = url;

    return info.streamingURL;
  }

  /**
   * Add the spotify song query handler.
   * @param query Query string to handle.
   * @param opts Query options
   * @returns 
   */
  public override async [QueryType.SPOTIFY_SONG](query: string, opts: ExtractorSearchOptions): Promise<ExtractorSearchResult> {
    if (!QueryResolver.regexes.spotifySongRegex.test(query))
      return this.emptyResult();

    if (dl.is_expired())
      await dl.refreshToken();

    const spotifyData = await dl.spotify(query).catch(Noop);
    if (!spotifyData) return this.emptyResult();

    const data = spotifyData as dl.SpotifyTrack;

    // Convert the fetched data to a track structure.
    const track = Track.fromSpotify(data, this, opts.type);

    // Create a new response from the empty result structure.
    const response = this.emptyResult();
    response.tracks.push(track);

    return response;
  }

  /**
   * Add the spotify playlist query handler.
   * @param query Query string to handle.
   * @param opts Query options
   * @returns 
   */
  public override async [QueryType.SPOTIFY_PLAYLIST](query: string, opts: ExtractorSearchOptions): Promise<ExtractorSearchResult> {
    if (!QueryResolver.regexes.spotifyPlaylistRegex.test(query))
      return this.emptyResult();
    
    if (dl.is_expired())
      await dl.refreshToken();

    // FIXME - opts not used.
    void opts;

    const spotifyData = await dl.spotify(query).catch(Noop);
    if (!spotifyData) return this.emptyResult();

    const data = spotifyData as dl.SpotifyPlaylist;

    // Convert the fetched data to a track structure.
    const playlist = await Playlist.fromSpotify(data, this, 'playlist');

    // Create a new response from the empty result structure.
    const response = this.emptyResult();
    response.tracks = playlist.tracks;
    response.playlist = playlist;

    return response;
  }

  /**
   * Add the spotify album query handler.
   * @param query Query string to handle.
   * @param opts Query options
   * @returns 
   */
  public override async [QueryType.SPOTIFY_ALBUM](query: string, opts: ExtractorSearchOptions): Promise<ExtractorSearchResult> {
    if (!QueryResolver.regexes.spotifyAlbumRegex.test(query))
      return this.emptyResult();
    
    if (dl.is_expired())
      await dl.refreshToken();

    // FIXME - opts not used.
    void opts;

    const spotifyData = await dl.spotify(query).catch(Noop);
    if (!spotifyData) return this.emptyResult();

    const data = spotifyData as dl.SpotifyAlbum;

    // Convert the fetched data to a track structure.
    const playlist = await Playlist.fromSpotify(data, this, 'album');

    // Create a new response from the empty result structure.
    const response = this.emptyResult();
    response.tracks = playlist.tracks;
    response.playlist = playlist;

    return response;
  }
}
