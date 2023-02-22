import type { TransformCallback } from 'stream';
import { PCMTransformer, PCMTransformerOptions } from '../pcm';

export interface VolumeTransformerOptions extends PCMTransformerOptions {
  volume?: number;
}

export class VolumeTransformer extends PCMTransformer {
  private _volume = 1;
  public constructor(options?: VolumeTransformerOptions) {
    super(options);

    if (typeof options?.volume === 'number') {
      this.setVolume(options.volume);
    }
  }

  public get volume(): number {
    return this._volume * 100;
  }

  public set volume(volume: number) {
    this.setVolume(volume);
  }

  public setVolume(volume: number): boolean {
    if (typeof volume !== 'number' || isNaN(volume)) return false;
    if (volume < 0) volume = 0;
    if (!isFinite(volume)) volume = 100;

    this._volume = volume / 100;

    this.onUpdate();

    return true;
  }

  public override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    if (this.disabled || this._volume === 1) {
      this.push(chunk);
      return callback();
    }

    const len = Math.floor(chunk.length / 2) * 2;
    const { bytes } = this;

    for (let i = 0; i < len; i += bytes) {
      const int = this._readInt(chunk, i);
      const amp = this.clamp(int * this._volume);
      this._writeInt(chunk, amp, i);
    }

    this.push(chunk);

    return callback();
  }

  public override toString() {
    return `${this.volume}%`;
  }
}
