import { Equalizer, EqualizerBand } from '../audio';

export const makeBands = (arr: number[]) => Array.from(
  {
    length: Equalizer.BAND_COUNT
  },
  (_, i) => ({
    band: i,
    gain: arr[i] ? arr[i] / 30 : 0
  })
) as EqualizerBand[];
