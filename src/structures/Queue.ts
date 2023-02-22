import type { VoiceConnection } from '@discordjs/voice';
import { Playlist } from './Playlist';
import type { Track } from './Track';
import { Transport, TransportOptions } from './Transport';
import { Resolver } from '../extractors';

export class Queue extends Resolver {
  public readonly id: string;
  private _queue: Track[] = [];
  private _transport: Transport | null = null;

  public constructor(id: string) {
    super();
    this.id = id;
  }

  /**
   * Check if there is a connection linked and it is useable.
   */
  public get connection(): boolean {
    if (this._transport?.useable) return true;
    this._transport = null;

    return false;
  }

  /**
   * Link a new connection destroy the old one if still active.
   * @param connection voice connection to use.
   * @param opts transport options.
   * @returns 
   */
  public linkConnection(connection: VoiceConnection, opts?: TransportOptions): this {
    if (this._transport) this._transport.murder();
    this._transport = new Transport(connection, opts);

    return this;
  } 

  /**
   * Adds new track(s) to the queue.
   * @param q track(s) to add.
   * @returns 
   */
  public add(q: Track | Track[] | Playlist): this {
    if (q instanceof Playlist)
      this._queue.push(...q.tracks);
    else if (Array.isArray(q))
      this._queue.push(...q);
    else
      this._queue.push(q);

    return this;
  }

  /**
   * Clears the queue.
   * @returns 
   */
  public clear(): this {
    this._queue = [];

    return this;
  }
  // public remove() {
  //   void this;
  // }

  /**
   * Play the first song in the queue or resume paused track.
   * @returns 
   */
  public async play(): Promise<this> {
    if (!this.connection)
      throw new Error('Connection not active, please link one.');

    
    await this._transport!.play(this._queue[0]);

    return this;
  }

  /**
   * Destroys the queue. After destruction it can still be used.
   * You will just need to link a new connection and add new tracks.
   */
  public destroy(): void {
    this.clear();
    this._transport?.murder();
  }
}
