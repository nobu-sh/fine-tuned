import type { TransformCallback } from 'stream';
import { Equalizer, EqualizerBand } from '../equalizer';
import { PCMTransformer, PCMTransformerOptions } from '../pcm';
import { AFPulsatorConfig, AFTremoloConfig, AFVibratoConfig, LR, applyEqualization, applyPulsator, applyTremolo, applyVibrato } from '../transformers';

export const AudioFilters = {
  '8D': '8D',
  Tremolo: 'Tremolo',
  Vibrato: 'Vibrato',
  BassBoost: 'BassBoost'
};

export type PCMFilters = keyof typeof AudioFilters;

export interface PCMFiltererOptions extends PCMTransformerOptions {
  filters?: PCMFilters[];
}

export const AF_NIGHTCORE_RATE = 1.3 as const;
export const AF_VAPORWAVE_RATE = 0.8 as const;

export const BASS_EQ_BANDS: EqualizerBand[] = Array.from({ length: 3 }, (_, i) => ({
  band: i,
  gain: 0.25
}));

// based on lavadsp
export class AudioFilter extends PCMTransformer {
  public filters: PCMFilters[] = [];
  public bassEQ = new Equalizer(
    2,
    BASS_EQ_BANDS.map((m) => m.gain)
  );

  public targetSampleRate = this.sampleRate;
  public totalSamples = 0;
  private _processedSamples = 0;

  public pulsatorConfig: AFPulsatorConfig = {
    hz: 0.02,
    x: 0,
    dI: 0.000003926990816987241
  };

  public tremoloConfig: AFTremoloConfig = {
    phase: 0,
    depth: 0.5,
    frequency: 5.0
  };

  public vibratoConfig: AFVibratoConfig = {
    phase: 0,
    depth: 0.5,
    frequency: 5.0
  };

  public constructor(options?: PCMFiltererOptions) {
    super(options);

    if (options && Array.isArray(options.filters)) {
      this.setFilters(options.filters);
    }

    this.onUpdate();
  }

  public setTargetSampleRate(rate: number): void {
    this.targetSampleRate = rate || this.sampleRate;
        
  }

  public setPulsator(hz: number): void {
    hz /= 4; // match ffmpeg
    this.pulsatorConfig.hz = hz;
    const samplesPerCycle = this.targetSampleRate / (hz * 2 * Math.PI);
    this.pulsatorConfig.dI = hz === 0 ? 0 : 1 / samplesPerCycle;

    this.onUpdate();
  }

  public get pulsator(): number {
    return this.pulsatorConfig.hz;
  }

  public setTremolo({ depth = this.tremoloConfig.depth, frequency = this.tremoloConfig.frequency, phase = this.tremoloConfig.phase }: Partial<AFTremoloConfig>): void {
    if (typeof depth === 'number') this.tremoloConfig.depth = depth;
    if (typeof frequency === 'number') this.tremoloConfig.frequency = frequency;
    if (typeof phase === 'number') this.tremoloConfig.phase = phase;

    this.onUpdate();
  }

  public setVibrato({ depth = this.vibratoConfig.depth, frequency = this.vibratoConfig.frequency, phase = this.vibratoConfig.phase }: Partial<AFVibratoConfig>): void {
    if (typeof depth === 'number') this.vibratoConfig.depth = depth;
    if (typeof frequency === 'number') this.vibratoConfig.frequency = frequency;
    if (typeof phase === 'number') this.vibratoConfig.phase = phase;

    this.onUpdate();
  }

  public get tremolo(): AFTremoloConfig {
    return this.tremoloConfig;
  }

  public setFilters(filters: PCMFilters[]): boolean {
    if (!Array.isArray(filters) || !filters.every((r) => r in AudioFilters)) {
      return false;
    }

    this.bassEQ.bandMultipliers = filters.includes('BassBoost') ? BASS_EQ_BANDS.map((m) => m.gain) : [];

    this.filters = filters;

    this.onUpdate();

    return true;
  }

  // TODO
  public seek(duration: number): void {
    // determines the sample to seek to
    // this._seekPos = (duration / 1000) * this.targetSampleRate;
    void duration;
    throw new Error('Not Implemented');

    // this method has not been implemented as of right now
    // Since we can only move forward in the stream,
    // we would have to buffer the entire stream in order to implement backwards seek
  }

  public override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this._processedSamples++;
    this.totalSamples += chunk.length / this.bits;

    if (this.disabled || !this.filters.length) {
      return callback(null, chunk);
    }

    const len = Math.floor(chunk.length / 2) * 2;
    const { bytes } = this;

    // left-right channel
    let L = false;

    for (let i = 0; i < len; i += bytes) {
      const int = this._readInt(chunk, i);
      const value = this.applyFilters(int, Number(L = !L) as LR);
      this._writeInt(chunk, this.clamp(value), i);
    }

    this.push(chunk);

    return callback();
  }

  public get currentSampleRate(): number {
    return this.targetSampleRate || this.sampleRate;
  }

  public get estimatedDuration(): number {
    // this wont be accurate (for example, livestream), but can be used as a fallback
    return (this.totalSamples / this.targetSampleRate) * 1000;
  }

  public get currentDuration(): number {
    // this may not be accurate
    return (this._processedSamples * 1000) / this.targetSampleRate;
  }

  public applyFilters(byte: number, channel: LR): number {
    if (this.filters.length) {
      for (const filter of this.filters) {
        if (filter === 'BassBoost') {
          byte = applyEqualization(this.bassEQ, byte);
        }

        if (filter === '8D') {
          byte = applyPulsator(this.pulsatorConfig, byte, channel);
        }

        if (filter === 'Tremolo') {
          byte = applyTremolo(this.tremoloConfig, byte, this.currentSampleRate);
        }

        if (filter === 'Vibrato') {
          byte = applyVibrato(this.vibratoConfig, byte, this.currentSampleRate);
        }
      }
    }

    return byte;
  }
}
