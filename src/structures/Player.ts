import type { VoiceConnection } from '@discordjs/voice';
import { Resolver } from '../extractors';
import { Transport, TransportOptions } from '../stream';

export class Player extends Resolver {
  private _transport: Transport | null = null;

  public getTransport(connection: VoiceConnection, options?: TransportOptions): Transport {
    if (!this._transport?.useable) this._transport = new Transport(connection, options);

    return this._transport;
  }
}
