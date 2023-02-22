import { makeBands } from './utils';

export enum QueryType {
  /**
   * Marks query as YouTube playlist url.
   * If it is not a playlist it will raise an error!
   */
  // TODO - searchable playlists
  YOUTUBE_PLAYLIST = 'youtubePlaylist',
  /**
   * Marks the query as a YouTube search.
   */
  YOUTUBE_SEARCH = 'youtubeSearch',
  /**
   * Marks the query as a YouTube video url.
   * If it is not a video url it will raise an error!
   */
  YOUTUBE_VIDEO = 'youtubeVideo',
  /**
   * Marks the query as a Spotify song url.
   * If it is not a Spotify song url it will raise an error!
   */
  SPOTIFY_SONG = 'spotifySong',
  /**
   * Marks the query as a Spotify album url.
   * If it is not a Spotify album url it will raise an error!
   */
  SPOTIFY_ALBUM = 'spotifyAlbum',
  /**
   * Marks the query as a Spotify playlist url.
   * If it is not a Spotify playlist url it will raise an error!
   */
  SPOTIFY_PLAYLIST = 'spotifyPlaylist',
}

export const EqualizerPreset = {
  Flat: makeBands([]),
  Classical: makeBands([-1.11022e-15, -1.11022e-15, -1.11022e-15, -1.11022e-15, -1.11022e-15, -1.11022e-15, -7.2, -7.2, -7.2, -9.6]),
  Club: makeBands([-1.11022e-15, -1.11022e-15, 8.0, 5.6, 5.6, 5.6, 3.2, -1.11022e-15, -1.11022e-15, -1.11022e-15]),
  Dance: makeBands([9.6, 7.2, 2.4, -1.11022e-15, -1.11022e-15, -5.6, -7.2, -7.2, -1.11022e-15, -1.11022e-15]),
  FullBass: makeBands([-8.0, 9.6, 9.6, 5.6, 1.6, -4.0, -8.0, -10.4, -11.2, -11.2]),
  FullBassTreble: makeBands([7.2, 5.6, -1.11022e-15, -7.2, -4.8, 1.6, 8.0, 11.2, 12.0, 12.0]),
  FullTreble: makeBands([-9.6, -9.6, -9.6, -4.0, 2.4, 11.2, 16.0, 16.0, 16.0, 16.8]),
  Headphones: makeBands([4.8, 11.2, 5.6, -3.2, -2.4, 1.6, 4.8, 9.6, 12.8, 14.4]),
  LargeHall: makeBands([10.4, 10.4, 5.6, 5.6, -1.11022e-15, -4.8, -4.8, -4.8, -1.11022e-15, -1.11022e-15]),
  Live: makeBands([-4.8, -1.11022e-15, 4.0, 5.6, 5.6, 5.6, 4.0, 2.4, 2.4, 2.4]),
  Party: makeBands([7.2, 7.2, -1.11022e-15, -1.11022e-15, -1.11022e-15, -1.11022e-15, -1.11022e-15, -1.11022e-15, 7.2, 7.2]),
  Pop: makeBands([-1.6, 4.8, 7.2, 8.0, 5.6, -1.11022e-15, -2.4, -2.4, -1.6, -1.6]),
  Reggae: makeBands([-1.11022e-15, -1.11022e-15, -1.11022e-15, -5.6, -1.11022e-15, 6.4, 6.4, -1.11022e-15, -1.11022e-15, -1.11022e-15]),
  Rock: makeBands([8.0, 4.8, -5.6, -8.0, -3.2, 4.0, 8.8, 11.2, 11.2, 11.2]),
  Ska: makeBands([-2.4, -4.8, -4.0, -1.11022e-15, 4.0, 5.6, 8.8, 9.6, 11.2, 9.6]),
  Soft: makeBands([4.8, 1.6, -1.11022e-15, -2.4, -1.11022e-15, 4.0, 8.0, 9.6, 11.2, 12.0]),
  SoftRock: makeBands([4.0, 4.0, 2.4, -1.11022e-15, -4.0, -5.6, -3.2, -1.11022e-15, 2.4, 8.8]),
  Techno: makeBands([8.0, 5.6, -1.11022e-15, -5.6, -4.8, -1.11022e-15, 8.0, 9.6, 9.6, 8.8])
} as const;

export const DefaultImage = 'https://cdn.discordapp.com/app-icons/1072778365439856670/b81d4ce2c09da194e55e1bc6763411bc.png?size=512';
