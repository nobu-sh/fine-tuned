import type { Options } from 'tsup';

export const tsup: Options = {
  // Compilation
  clean: true,
  minify: false,
  dts: false,

  // Module
  target: 'es2022',
  format: ['esm', 'cjs'],
  skipNodeModulesBundle: true,

  // Decaration Emission
  sourcemap: true,

  // Entry
  entryPoints: ['src/index.ts'],

  // Exit
  outDir: 'lib',
};
