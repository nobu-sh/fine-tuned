import * as dl from 'play-dl';
import { YouTube as YTSR } from 'youtube-sr';
import { Extractor, ExtractorSearchOptions, ExtractorSearchResult } from './Extractor';
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
   * Takes the given track information and returns the url to the readable stream.
   * @param info Track information.
   */
  public async stream(info: Track): Promise<string> {
    if (info.streamingURL) return info.streamingURL;
    if (!info.destinationURL)
      info.destinationURL = await this.fetchStreamURL(info);

    // FIXME - url expire time, automatic streaming url refreshes
    // FIXME - ytdl is a lot better we should really start enforcing data
    // filled through there and not ytsr before production
    const inf = await dl.video_info(info.destinationURL);
    console.log(inf);
    if (inf.LiveStreamData.hlsManifestUrl) {
      info.streamingURL = inf.LiveStreamData.hlsManifestUrl;

      return inf.LiveStreamData.hlsManifestUrl;
    }

    const fmts = inf.format
      .filter((fmt) => {
        // const re = /\/manifest\/hls_(variant|playlist)\//;
        // FIXME - the manifest is not in the formats?? its in the LiveSteamData object
        // if (inf.video_details.live) return re.test(fmt.url) && typeof fmt.bitrate === 'number';
        if (!fmt.url) return false;
        return typeof fmt.bitrate === 'number';
      })
      .sort((a, b) => Number(b.bitrate) - Number(a.bitrate));

    // FIXME - videos don't have quality labels on audio only streams, live streams always have quality labels and they start with AUDIO_
    // videos also have a field for audioQuality for audio only streams
    const fmt = fmts.find((fmt) => !fmt.qualityLabel) ?? fmts.sort((a, b) => Number(a.bitrate) - Number(b.bitrate))[0];
    // Eslint is on some coke or something bro
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!fmt?.url) throw new Error(`Failed to get streaming url for [Track "${info.toString()}"]`);
    info.streamingURL = fmt.url;
    
    return fmt.url;
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
