import type { SpotifyAlbum, SpotifyPlaylist } from 'play-dl';
import type { Playlist as SRPlaylist } from 'youtube-sr';
import { Track } from './Track';
import { DefaultImage, QueryType } from '../constants';
import type { Extractor } from '../extractors';
import type { PlaylistType, RawPlaylistData } from '../types';

export class Playlist {
  /**
   * Tracks of the playlist.
   */
  public readonly tracks: Track[];
  /**
   * Title of the playlist.
   */
  public readonly title: string;
  /**
   * Description of the playlist.
   */
  public readonly description: string;
  /**
   * Thumbnail of the playlist.
   */
  public readonly thumbnail: string;
  /**
   * Type of the playlist.
   */
  public readonly type: PlaylistType;
  /**
   * Author of the playlist.
   */
  public readonly author: string;
  /**
   * ID of the playlist.
   */
  public readonly id: string;
  /**
   * URL of the playlist.
   */
  public readonly url: string;

  public constructor(data: RawPlaylistData) {
    this.tracks = data.tracks;
    this.title = data.title;
    this.description = data.description;
    this.thumbnail = data.thumbnail;
    this.type = data.type;
    this.author = data.author;
    this.id = data.id;
    this.url = data.url;
  }

  // Makes the playlist iterable.
  public *[Symbol.iterator]() {
    yield* this.tracks;
  }

  /**
   * Generates a new playlist from a youtube-sr playlist search result.
   * @param playlist The playlist to convert.
   * @param extractor extractor the tracks will need to use.
   * @param type type the playlist is.
   */
  public static fromYTSR(playlist: SRPlaylist, extractor: Extractor, type: PlaylistType): Playlist {
    // Map all the tracks into Track structures.
    const tracks = playlist.videos.map((video) =>
      Track.fromYTSR(video, extractor, QueryType.YOUTUBE_VIDEO)
    );

    const title = playlist.title?.length ? playlist.title : 'Unknown Playlist';
    const author = playlist.channel?.name?.length ? playlist.channel.name : 'Unknown Author';
    const description = `${title} put together by ${author}.`;
    const thumbnail = playlist.thumbnail?.displayThumbnailURL('maxresdefault')
      ?? DefaultImage;

    return new this({
      title,
      description,
      author,
      thumbnail,
      type,
      id: playlist.id ?? 'nil',
      url: playlist.url ?? 'https://youtube.com/',
      tracks,
    });
  }

  /**
   * Generates a new playlist from a Spotify data search result.
   * @param playlist Spotify playlist or album data to use.
   * @param extractor extractor the tracks will need to use.
   * @param type type the playlist is.
   * @returns 
   */
  public static async fromSpotify(playlist: SpotifyPlaylist | SpotifyAlbum, extractor: Extractor, type: PlaylistType): Promise<Playlist> {
    switch(playlist.type) {
      case 'playlist': {
        const data = playlist as SpotifyPlaylist;

        const page = await data.all_tracks();
        const tracks = page
          .map((t) => Track.fromSpotify(t, extractor, QueryType.SPOTIFY_SONG));
  
        const description = data.description.length
          ? data.description 
          : `${data.name} put together by ${data.owner.name}.`;

        return new this({
          title: data.name,
          description,
          thumbnail: data.thumbnail.url,
          type,
          author: data.owner.name,
          id: data.id,
          url: data.url,
          tracks,
        });
      }
      case 'album': {
        const data = playlist as SpotifyAlbum;

        const page = await data.all_tracks();
        const tracks = page
          .map((t) => Track.fromSpotify(t, extractor, QueryType.SPOTIFY_SONG));
  
        return new this({
          title: data.name,
          description: `${data.name} by ${data.artists.map((m) => m.name).join(', ')}`,
          thumbnail: data.thumbnail.url,
          type,
          author: data.artists[0]?.name.length ? data.artists[0].name : 'Unknown Author',
          id: data.id,
          url: data.url,
          tracks,
        });
      }
      default:
        throw new Error('Not a Spotify playlist or album!');
    }
  }
}
