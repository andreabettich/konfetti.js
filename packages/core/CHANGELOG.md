# @konfetti-js/core

## 0.4.0

### Minor Changes

- 0c44942: Confetti now behaves like paper. Each piece tumbles in 3D around three axes and is shaded by a light from the upper left, so it flashes lighter and darker as it turns. Air resistance slows the burst quickly, then pieces sway down slowly like falling leaves and disappear once they leave the screen instead of fading out in mid-air. The previous flat look and physics are gone.

  Option changes that come with it:

  - `ticks` is now the longest a piece may live and defaults to 600 (10 seconds); pieces usually leave the screen first.
  - `drift` is now wind: the air moves sideways and carries the pieces with it.
  - `decay` is the air resistance; `gravity` still scales how fast pieces fall.

## 0.3.0

### Minor Changes

- ecb2482: Fix the animation lifecycle and make bursts behave the same everywhere:

  - Confetti no longer stops working after the tab was hidden and shown while nothing was animating, and pausing and resuming can no longer start a second animation loop.
  - Motion and lifetime are now time-based, so confetti looks the same on 60 Hz and 120 Hz screens.
  - The full-screen canvas renders at the screen's pixel density, so pieces are sharp on high-density displays.
  - `zIndex` now applies to the canvas.
  - Each burst keeps its own gravity and decay; a later burst no longer changes earlier pieces.
  - Invalid option values (such as `NaN`) fall back to the defaults instead of clearing live particles, and `colors` accepts any CSS color.
  - Presets keep their own values when an option is passed as `undefined`, and `origin` merges per axis, so `{ x: 0.2 }` keeps the preset's `y`.
  - `reset()` also cancels pending `fireworks()` bursts and running `continuous()` streams.
  - `fire()` and the presets do nothing on the server instead of throwing, and bursts fired while the page is hidden are skipped.
  - Each instance owns its canvas; a destroyed instance ignores further calls. The full-screen canvas is marked `aria-hidden`.

  New: `firePreset(name, options)`, `fireFromElement(element, options)`, `originFromElement(element)`, `destroy()`, `isPresetName()`, `PRESET_NAMES`, and `preset()`/`continuous()` on instances from `create()`. The unused `useWorker` create option was removed.

- ecb2482: Fix packaging for every module system:

  - `@konfetti-js/core` now ships a real CommonJS build, so `require('@konfetti-js/core')` and the wrappers' CommonJS builds work. Type declarations are bundled and resolve under `moduleResolution: "NodeNext"`.
  - The browser bundle moved to `dist/konfetti.min.js` (minified, exposes `window.konfetti`) and is the default file on unpkg and jsDelivr.
  - All packages declare `sideEffects: false` and separate ESM and CommonJS types, and every package now ships a README.
  - The framework wrappers now depend on `@konfetti-js/core` directly, so installing a wrapper is enough. If you also install core yourself, keep it on the same version.
  - The full-screen canvas now has the class `konfetti-canvas` instead of the id `konfetti-canvas`, since every instance owns its own canvas.
  - All packages are now versioned together.

- 881ae21: Publish all packages under the `@konfetti-js` npm scope: `konfetti.js` is now `@konfetti-js/core` and the `@konfetti/*` wrappers are now `@konfetti-js/*`.

## 0.2.0

Published as `konfetti.js` (now renamed to `@konfetti-js/core`).

### Minor Changes

- f3d99dc: inital commit for changeset and first release
