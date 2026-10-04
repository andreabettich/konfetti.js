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
- All packages declare `sideEffects: false`, separate ESM and CommonJS types, and a caret peer range on `@konfetti-js/core`. Every package now ships a README.
- All packages are now versioned together.
