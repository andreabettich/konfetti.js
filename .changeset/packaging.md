---
"@konfetti-js/core": minor
"@konfetti-js/react": minor
"@konfetti-js/vue": minor
"@konfetti-js/svelte": minor
"@konfetti-js/solid": minor
"@konfetti-js/web-components": minor
---

Fix packaging for every module system:

- `@konfetti-js/core` now ships a real CommonJS build, so `require('@konfetti-js/core')` and the wrappers' CommonJS builds work. Type declarations are bundled and resolve under `moduleResolution: "NodeNext"`.
- The browser bundle moved to `dist/konfetti.min.js` (minified, exposes `window.konfetti`) and is the default file on unpkg and jsDelivr.
- All packages declare `sideEffects: false` and separate ESM and CommonJS types, and every package now ships a README.
- The framework wrappers now depend on `@konfetti-js/core` directly, so installing a wrapper is enough. If you also install core yourself, keep it on the same version.
- The full-screen canvas now has the class `konfetti-canvas` instead of the id `konfetti-canvas`, since every instance owns its own canvas.
- All packages are now versioned together.
