import type { Equalizer } from '../equalizer';

export function applyEqualization(eq: Equalizer, int: number): number {
  const processor = eq.channels[0];
  const result = processor.processInt(int);
  processor.step();
  return result;
}
