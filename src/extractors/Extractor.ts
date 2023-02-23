// import type { Readable } from 'stream';
import { QueryType } from '../constants';
import type { Playlist, Track } from '../structures';
import type { Awaitable } from '../types';

export abstract class Extractor {
  /**
   * Identifier of the extractor.
   */
  public readonly abstract id: string;
  /**
   * Options of the extractor.
   */
  public readonly _opts: ExtractorOptions;
  public constructor(opts?: ExtractorOptions) {
    this._opts = opts ?? {};
  }

  /**
   * Empty extractor search result.
   * @returns An empty extractor search result.
   */
  public emptyResult(): ExtractorSearchResult {
    return {
      tracks: [],
      playlist: null,
    };
  }

  /**
   * Empty extractor search result.
   * @returns An empty extractor search result.
   */
  public static emptyResult(): ExtractorSearchResult {
    return {
      tracks: [],
      playlist: null,
    };
  }
  
  /**
   * Handles the given query and *hopefully* returns a useful result.
   * @param query Query string.
   * @param opts Handling options.
   */
  public abstract handle(query: string, opts: ExtractorSearchOptions): Awaitable<ExtractorSearchResult>;
  
  /**
   * Takes the given track information and returns a url to the readable stream.
   * @param info Track information.
   */
  public abstract stream(info: Track): Awaitable<string>;

  /**
   * Handler for the spotify album query type.
   * @param query Query String.
   * @param opts Query Options.
   */
  public [QueryType.SPOTIFY_ALBUM](query: string, opts: ExtractorSearchOptions): Awaitable<ExtractorSearchResult> {
    void [query, opts];
    throw new Error('Extractor does not support spotify album query type.');
  }

  /**
   * Handler for the spotify playlist query type.
   * @param query Query String.
   * @param opts Query Options.
   */
  public [QueryType.SPOTIFY_PLAYLIST](query: string, opts: ExtractorSearchOptions): Awaitable<ExtractorSearchResult> {
    void [query, opts];
    throw new Error('Extractor does not support spotify playlist query type.');
  }

  /**
   * Handler for the spotify song query type.
   * @param query Query String.
   * @param opts Query Options.
   */
  public [QueryType.SPOTIFY_SONG](query: string, opts: ExtractorSearchOptions): Awaitable<ExtractorSearchResult> {
    void [query, opts];
    throw new Error('Extractor does not support spotify song query type.');
  }

  /**
   * Handler for the youtube playlist query type.
   * @param query Query String.
   * @param opts Query Options.
   */
  public [QueryType.YOUTUBE_PLAYLIST](query: string, opts: ExtractorSearchOptions): Awaitable<ExtractorSearchResult> {
    void [query, opts];
    throw new Error('Extractor does not support youtube playlist query type.');
  }

  /**
   * Handler for the youtube search query type.
   * @param query Query String.
   * @param opts Query Options.
   */
  public [QueryType.YOUTUBE_SEARCH](query: string, opts: ExtractorSearchOptions): Awaitable<ExtractorSearchResult> {
    void [query, opts];
    throw new Error('Extractor does not support youtube search query type.');
  }

  /**
   * Handler for the youtube video query type.
   * @param query Query String.
   * @param opts Query Options.
   */
  public [QueryType.YOUTUBE_VIDEO](query: string, opts: ExtractorSearchOptions): Awaitable<ExtractorSearchResult> {
    void [query, opts];
    throw new Error('Extractor does not support youtube video query type.');
  }
}

/**
 * Unused rn.
 */
export interface ExtractorOptions {}

/**
 * Result of an extractor search.
 */
export interface ExtractorSearchResult {
  /**
   * Tracks found for give query.
   */
  tracks: Track[];
  /**
   * Playlist found for given query.
   */
  playlist: Playlist | null;
}

/**
 * Options for extractor search.
 */
export interface ExtractorSearchOptions {
  /**
   * What the type of query is.
   */
  type: QueryType;
  /**
   * Limit amount of tracks to fetch.
   */
  limit?: number;
  /**
   * Limit amount of tracks to fetch from a playlist.
   */
  playlistLimit?: number;
}
