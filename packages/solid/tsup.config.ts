import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['solid-js', 'konfetti.js'],
  esbuildOptions(options) {
    options.jsx = 'preserve';
    options.jsxImportSource = 'solid-js';
  },
});
