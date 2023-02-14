import type { Track } from '../structures';

export type PlaylistType = 'album' | 'playlist';

export interface RawPlaylistData {
  /**
   * The tracks of the playlist mapped into Track structures.
   */
  tracks: Track[];
  /**
   * The title of the playlist.
   */
  title: string;
  /**
   * The description of the playlist.
   * (YouTube does not provide this so the title is passed instead)
   */
  description: string;
  /**
   * The thumbnail of the playlist.
   */
  thumbnail: string;
  /**
   * The type of the playlist.
   */
  type: PlaylistType;
  /**
   * The author of the playlist.
   */
  author: string;
  /**
   * The ID of the playlist.
   */
  id: string;
  /**
   * The URL of the playlist.
   */
  url: string;
}
