import type { SpotifyTrack } from 'play-dl';
import type { Video } from 'youtube-sr';
import { DefaultImage, QueryType } from '../constants';
import type { Extractor } from '../extractors';
import type { RawTrackData } from '../types';
import { buildTimeCode, parseMS } from '../utils';

export class Track {
  /**
   * Title of the track.
   */
  public readonly title: string;
  /**
   * Description of the track.
   */
  public readonly description: string;
  /**
   * Author of the track.
   */
  public readonly author: string;
  /**
   * Source URL of the track.
   */
  public readonly url: string;
  /**
   * Thumbnail of the track.
   */
  public readonly thumbnail: string;
  /**
   * Formatted duration of the track.
   */
  public readonly duration: string;
  /**
   * Views of the track.
   */
  public readonly views: number;
  /**
   * Whether the track is live or not.
   */
  public readonly live: boolean;
  /**
   * Source type of the track.
   */
  public readonly queryType: QueryType;
  /**
   * Extractor used to get the track data.
   */
  public readonly extractor: Extractor;
  /**
   * Useable converted URL for streaming.
   */
  private _destinationUrl: string | null = null;
  private _streamingUrl: string | null = null;

  public constructor(data: RawTrackData, isDestinationUrl = false) {
    this.title = data.title;
    this.description = data.description;
    this.author = data.author;
    this.url = data.url;
    this.thumbnail = data.thumbnail;
    this.duration = data.duration;
    this.views = data.views;
    this.live = data.live;
    this.queryType = data.queryType;
    this.extractor = data.extractor;

    if (isDestinationUrl)
      this._destinationUrl = data.url;
  } 

  /**
   * Gets the URL to use for getting the streaming URL.
   */
  public get destinationURL(): string | null {
    return this._destinationUrl;
  }

  /**
   * Sets the URL to use for getting the streaming URL.
   */
  public set destinationURL(url: string | null) {
    this._destinationUrl = url;
  }

  /**
   * Gets the URL to use for streaming.
   */
  public get streamingURL(): string | null {
    return this._streamingUrl;
  }

  /**
   * Sets the URL to use for streaming.
   */
  public set streamingURL(url: string | null) {
    this._streamingUrl = url;
  }

  /**
   * Convers the formatted duration to milliseconds.
   */
  public get durationMs(): number {
    // NOTE - I stole this from discord-player. This looks very shitty.
    // I assume there is a wayyy better way to do this. I'll look into it.

    const times = (n: number, t: number) => {
      let tn = 1;
      for (let i = 0; i < t; i++) tn *= n;
      return t <= 0 ? 1000 : tn * 1000;
    };

    return this.duration
      .split(':')
      .reverse()
      .map((m, i) => parseInt(m, 10) * times(60, i))
      .reduce((a, c) => a + c, 0);
  }

  /**
   * String representation of the track.
   * @returns 
   */
  public toString(): string {
    return `${this.title} - ${this.author}`;
  }

  /**
   * Generates a new track from a youtube-sr video search result.
   * @param video youtube-sr video search result.
   * @param extractor the extractor used to get this songs data.
   * @param queryType query type of the track.
   * @returns 
   */
  public static fromYTSR(video: Video, extractor: Extractor, queryType: QueryType): Track {
    const title = video.title?.length ? video.title : 'Unknown Title';
    const author = video.channel?.name?.length ? video.channel.name : 'Unknown Author';
    const description = video.description?.length
      ? video.description
      : `${title} by ${author}`;
    const thumbnail = video.thumbnail?.displayThumbnailURL('maxresdefault') 
      ?? DefaultImage;


    return new this({
      title,
      description,
      author,
      url: video.url,
      thumbnail,
      views: video.views,
      duration: video.durationFormatted,
      queryType,
      extractor,
      live: video.live,
    }, true);
  }

  /**
   * Generates a new track from a spotify track result.
   * @param data Spotify track data.
   * @param extractor the extractor used to get this tracks data.
   * @param queryType query type of the track.
   * @returns 
   */
  public static fromSpotify(data: SpotifyTrack, extractor: Extractor, queryType: QueryType): Track {
    return new this({
      title: data.name,
      description: `${data.name} by ${data.artists.map((m) => m.name).join(', ')}`,
      author: data.artists[0]?.name.length ? data.artists[0].name : 'Unknown Author',
      url: data.url,
      thumbnail: data.thumbnail?.url ?? 'https://www.scdn.co/i/_global/twitter_card-default.jpg',
      duration: buildTimeCode(parseMS(data.durationInMs)),
      views: -1,
      queryType,
      extractor,
      live: false,
    });
  }
}
