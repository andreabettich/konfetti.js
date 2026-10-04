import { defineConfig } from 'tsup';

export default defineConfig([
  // npm: ESM + CommonJS with bundled type declarations (.d.ts and .d.cts)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
  },
  // CDN / <script> tag: minified IIFE exposing window.konfetti
  {
    entry: { konfetti: 'src/index.ts' },
    format: ['iife'],
    globalName: 'konfetti',
    minify: true,
    sourcemap: true,
    target: 'es2020',
    outExtension: () => ({ js: '.min.js' }),
  },
]);
