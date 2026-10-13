import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    target: 'es2020',
    clean: false,
    fixedExtension: false,
  },
  {
    entry: { konfetti: 'src/index.ts' },
    format: ['iife'],
    globalName: 'konfetti',
    minify: true,
    sourcemap: true,
    target: 'es2020',
    clean: false,
    fixedExtension: false,
    outputOptions: { entryFileNames: '[name].min.js' },
  },
]);
