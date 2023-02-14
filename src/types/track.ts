import type { QueryType } from '../constants';
import type { Extractor } from '../extractors';

export interface RawTrackData {
  /**
   * The title of the track.
   */
  title: string;
  /**
   * The description of the track.
   */
  description: string;
  /**
   * The author of the track.
   */
  author: string;
  /**
   * The RAW URL of the track.
   */
  url: string;
  /**
   * The thumbnail of the track.
   */
  thumbnail: string;
  /**
   * The duration of the track in a formatted string.
   */
  duration: string;
  /**
   * The views of the track.
   */
  views: number;
  /**
   * Whether the track is live or not.
   */
  live: boolean;
  /**
   * The query type of the track.
   */
  queryType: QueryType;
  /**
   * The extractor used to get the track data.
   * (used to get the track stream once its ready to be played).
   */
  extractor: Extractor;
}
