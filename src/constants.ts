export enum QueryType {
  /**
   * Marks query as YouTube playlist url.
   * If it is not a playlist it will raise an error!
   */
  // NOTE - make if playlist is selected but not a valid 
  // playlist url then attempt to find the playlist by
  // give query.
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

export const DefaultImage = 'https://cdn.discordapp.com/app-icons/1072778365439856670/b81d4ce2c09da194e55e1bc6763411bc.png?size=512';
