import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  fixedExtension: false,
  deps: { neverBundle: ['@konfetti-js/core'] },
});
