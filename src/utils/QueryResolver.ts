import { YouTube } from 'youtube-sr';
import { QueryType } from '../constants';

// SECTION - Scary Regex Shit stolen from https://github.com/Androz2091/discord-player
// hopefully these urls dont change toooooo often ;/
const spotifySongRegex = /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})(\?si=.+)?$/;
const spotifyPlaylistRegex = /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})(\?si=.+)?$/;
const spotifyAlbumRegex = /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})(\?si=.+)?$/;
// !SECTION - Scary Shit End!

// Yes yes, static only classes are a nono in the javascript paradigm
// but you know what..? Go fuck yourself, it looks nice.
export class QueryResolver {
  /**
   * Gets all the regexes used.
   */
  public static get regexes() {
    return {
      spotifySongRegex,
      spotifyPlaylistRegex,
      spotifyAlbumRegex,
    };
  }

  /**
   * Validator methods for all query types.
   */
  public static get validators() {
    return {
      [QueryType.YOUTUBE_VIDEO](query: string): boolean {
        if (!QueryResolver.validateYouTubeId(query) && !QueryResolver.validateYouTubeURL(query))
          return false;

        return true;
      },
      [QueryType.YOUTUBE_PLAYLIST](query: string): boolean {
        return YouTube.isPlaylist(query);
      },
      [QueryType.YOUTUBE_SEARCH](query: string): boolean {
        if (typeof query !== 'string') return false;
        return true;
      },
      [QueryType.SPOTIFY_SONG](query: string): boolean {
        return spotifySongRegex.test(query);
      },
      [QueryType.SPOTIFY_PLAYLIST](query: string): boolean {
        return spotifyPlaylistRegex.test(query);
      },
      [QueryType.SPOTIFY_ALBUM](query: string): boolean {
        return spotifyAlbumRegex.test(query);
      }
    };
  }

  /**
   * Resolves the QueryType based on the query.
   * @param query String query of any type.
   * @returns 
   */
  public static resolve(query: string): QueryType {
    query = query.trim();

    if (YouTube.isPlaylist(query)) return QueryType.YOUTUBE_PLAYLIST;
    if (QueryResolver.validateYouTubeId(query) || QueryResolver.validateYouTubeURL(query))
      return QueryType.YOUTUBE_VIDEO;
    if (spotifySongRegex.test(query)) return QueryType.SPOTIFY_SONG;
    if (spotifyPlaylistRegex.test(query)) return QueryType.SPOTIFY_PLAYLIST;
    if (spotifyAlbumRegex.test(query)) return QueryType.SPOTIFY_ALBUM;

    return QueryType.YOUTUBE_SEARCH;
  }

  /**
   * Validates if the give query matches the give query type.
   * @param query String of any type.
   * @param type QueryType specification.
   * @returns 
   */
  public static validate(query: string, type: QueryType): boolean {
    return this.validators[type](query);
  }

  /**
   * Validates if the provided URL is a YouTube URL.
   * @param url URL of any type.
   * @returns 
   */
  public static validateYouTubeURL(url: string): boolean {
    return YouTube.Regex.VIDEO_URL.test(url);
  }

  /**
   * Validates if the provided string is a YouTube video id.
   * @param id String of any type. 
   * @returns 
   */
  public static validateYouTubeId(id: string): boolean {
    return YouTube.Regex.VIDEO_ID.test(id);
  }
}
