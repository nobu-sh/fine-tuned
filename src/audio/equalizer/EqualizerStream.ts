import type { TransformCallback } from 'stream';
import { Equalizer } from './Equalizer';
import { PCMTransformer, PCMTransformerOptions } from '../pcm';

export interface EqualizerStreamOptions extends PCMTransformerOptions {
  bandMultiplier?: EqualizerBand[];
  channels?: number;
}

export interface EqualizerBand {
  band: number;
  gain: number;
}

export class EqualizerStream extends PCMTransformer {
  public bandMultipliers = new Array(Equalizer.BAND_COUNT).fill(0) as number[];
  public equalizer: Equalizer;
  public constructor(options?: EqualizerStreamOptions) {
    super(options);

    options = Object.assign(
      {},
      {
        bandMultiplier: [],
        channels: 1
      },
      options ?? {}
    );

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    this.equalizer = new Equalizer(options.channels || 1, this.bandMultipliers);
    if (Array.isArray(options.bandMultiplier)) this._processBands(options.bandMultiplier);
  }

  public _processBands(multiplier: EqualizerBand[]): void {
    for (const mul of multiplier) {
      if (mul.band > Equalizer.BAND_COUNT - 1 || mul.band < 0) throw new RangeError(`Band value out of range. Expected >0 & <${Equalizer.BAND_COUNT - 1}, received "${mul.band}"`);
      this.equalizer.setGain(mul.band, mul.gain);
    }

    this.onUpdate();
  }

  public override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    if (this.disabled) {
      this.push(chunk);
      return callback();
    }

    this.equalizer.process([
      {
        data: chunk,
        extremum: this.extremum,
        readInt: (b, idx) => this._readInt(b, idx),
        writeInt: (b, i, idx) => this._writeInt(b, i, idx),
        bytes: this.bytes
      }
    ]);

    this.push(chunk);

    return callback();
  }

  public getEQ(): EqualizerBand[] {
    return this.bandMultipliers.map((m, i) => ({
      band: i,
      gain: m
    })) as EqualizerBand[];
  }

  public setEQ(bands: EqualizerBand[]): void {
    this._processBands(bands);
  }

  public resetEQ(): void {
    this._processBands(
      Array.from(
        {
          length: Equalizer.BAND_COUNT
        },
        (_, i) => ({
          band: i,
          gain: 0
        })
      )
    );
  }
}
