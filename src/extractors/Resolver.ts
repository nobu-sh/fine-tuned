import { Extractor, ExtractorSearchResult } from './Extractor';
import { Spotify } from './Spotify';
import { YouTube } from './YouTube';
import type { QueryType } from '../constants';
import { isFulfilled, QueryResolver } from '../utils';

export class Resolver {
  public readonly extractors: Extractor[];
  
  public constructor() {
    this.extractors = [new Spotify(), new YouTube()];
    return this;
  }

  /**
   * Attempts to resolve query to tracks. This mode will automatically assess
   * the query and attempt to use the correct query type when extracting. If
   * it cannot resolve to a valid query type it will attempt to search youtube.
   * @param query string extractors should attempt to use to get results.
   * @returns 
   */
  public async search(query: string): Promise<ExtractorSearchResult> {
    const type = QueryResolver.resolve(query);

    // FIXME: Support other options
    const searchUnsettled = this.extractors.map((e) => e.handle(query, { type }));
    const searches = await Promise.allSettled(searchUnsettled);

    return searches.find(isFulfilled)?.value ?? Extractor.emptyResult();
  }

  /**
   * Attempts to resolve query into tracks. This mode will use the query type
   * you set for a controlled search. If it cannot find results it will return
   * an empty result.
   * @param query 
   * @param type 
   * @returns 
   */
  public async controlledSearch(query: string, type: QueryType): Promise<ExtractorSearchResult> {
    // FIXME: Support other options
    const searchUnsettled = this.extractors.map((e) => e.handle(query, { type }));
    const searches = await Promise.allSettled(searchUnsettled);

    return searches.find(isFulfilled)?.value ?? Extractor.emptyResult();
  }
}
