import type { Track } from './Track';
import { Resolver } from '../extractors';

export class Player extends Resolver {
  private _track: Track | undefined;
  private _isPaused = false;

  public constructor() {
    super();
    return this;
  }

  public play(track?: Track) {
    if (this._isPaused) this._isPaused = false;
    if (!track) return;

    this._track = track;
  }

  public pause() {
    if (!this._isPaused) this._isPaused = true;
  }
}
