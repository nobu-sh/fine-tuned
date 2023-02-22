import type { Client } from 'discord.js';
import { setToken } from 'play-dl';
import { QueueManager } from './QueueManager';
import { warn } from '../utils';

export class FineTuned {
  public readonly client: Client;
  public readonly options: FineTunedOptions;
  public readonly queue = new QueueManager();
  private _spotifyReady = false; 

  public constructor(client: Client, options?: FineTunedOptions) {
    this.client = client;
    this.options = options ?? {};

    if (!this.options.spotify) 
      warn('No Spotify credentials set! Spotify based searches will not function!', 'FineTuned');
  }

  public get spotifyReady() {
    return this._spotifyReady;
  }

  public async authSpotify(): Promise<void> {
    if (this._spotifyReady) return;
    if (!this.options.spotify)
      throw new Error('Could not find spotify credentials!');
    
    await setToken({
      spotify: {
        client_id: this.options.spotify.client_id,
        client_secret: this.options.spotify.client_secret,
        refresh_token: this.options.spotify.refresh_token,
        market: this.options.spotify.market,
      },
    });

    this._spotifyReady = true;
  }
}

export interface FineTunedOptions {
  /**
   * In order to use spotify you must register a dev app.
   */
  spotify?: FineTunedSpotify;
}

export interface FineTunedSpotify {
  client_id: string;
  client_secret: string;
  refresh_token: string;
  market: string;
}
