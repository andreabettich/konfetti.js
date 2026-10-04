# @konfetti-js/vue

## 0.4.0

### Patch Changes

- Updated dependencies [0c44942]
  - @konfetti-js/core@0.4.0

## 0.3.0

### Minor Changes

- ecb2482: Fix packaging for every module system:

  - `@konfetti-js/core` now ships a real CommonJS build, so `require('@konfetti-js/core')` and the wrappers' CommonJS builds work. Type declarations are bundled and resolve under `moduleResolution: "NodeNext"`.
  - The browser bundle moved to `dist/konfetti.min.js` (minified, exposes `window.konfetti`) and is the default file on unpkg and jsDelivr.
  - All packages declare `sideEffects: false` and separate ESM and CommonJS types, and every package now ships a README.
  - The framework wrappers now depend on `@konfetti-js/core` directly, so installing a wrapper is enough. If you also install core yourself, keep it on the same version.
  - The full-screen canvas now has the class `konfetti-canvas` instead of the id `konfetti-canvas`, since every instance owns its own canvas.
  - All packages are now versioned together.

- 881ae21: Publish all packages under the `@konfetti-js` npm scope: `konfetti.js` is now `@konfetti-js/core` and the `@konfetti/*` wrappers are now `@konfetti-js/*`.
- ecb2482: Fix wrapper bugs and share preset handling through core:

  - React: `<Konfetti preset>` no longer loses the preset's settings, fires once per `true` even in StrictMode, and supports the documented `onFired` callback. `useKonfetti()` stops its stream on unmount and returns stable functions.
  - Solid: `<Konfetti>` supports `onFired`.
  - Vue: `v-konfetti` picks up changes to its bound options, including `trigger`. `useKonfetti()` cleans up through `onScopeDispose`.
  - Svelte: `createKonfetti()` stops its stream when the component is destroyed.
  - Web Components: `<konfetti-trigger>` no longer fires twice per click or keeps an old listener when `trigger` changes. Invalid numeric attributes are ignored, a `z-index` attribute is supported, and importing the package during server rendering no longer throws.

### Patch Changes

- Updated dependencies [ecb2482]
- Updated dependencies [ecb2482]
- Updated dependencies [881ae21]
  - @konfetti-js/core@0.3.0
