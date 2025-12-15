import typescript from '@rollup/plugin-typescript';

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/konfetti.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types',
      }),
    ],
  },
  // IIFE build (for browsers/CDN - accessible via window.konfetti)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/konfetti.umd.js',
      format: 'iife',
      name: 'konfetti',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
  },
];
