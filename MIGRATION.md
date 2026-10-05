# Migrating from `konfetti.js` to `@konfetti-js/core`

The `konfetti.js` package (last version 0.2.0) is now published as **`@konfetti-js/core`**. The functions and option names are the same, so for most projects the switch is a package swap. What changed is how the confetti looks and moves, and the meaning of a few options.

## The short version

```bash
npm uninstall konfetti.js
npm install @konfetti-js/core
```

```diff
- import { fire, cannon } from 'konfetti.js';
+ import { fire, cannon } from '@konfetti-js/core';
```

Then read [the new look](#the-new-look-paper-confetti) and [options that changed](#options-that-changed) to see whether any of your settings need adjusting.

## Package and imports

- **Same exports.** `fire`, `reset`, `create`, the `Konfetti` class and every preset (`cannon`, `explosion`, `fireworks`, `rain`, `snow`, `sideCannons`, `pride`, `continuous`) keep their names and arguments.
- **CommonJS works.** `require('@konfetti-js/core')` returns the API. In `konfetti.js` 0.2.0 it returned an empty object.
- **Framework wrappers are new.** Use `@konfetti-js/react`, `@konfetti-js/vue`, `@konfetti-js/svelte`, `@konfetti-js/solid` or `@konfetti-js/web-components` instead of calling core from your components. Each installs core for you. The `@konfetti/*` names in older READMEs were never published.

## CDN

```diff
- <script src="https://cdn.jsdelivr.net/npm/konfetti.js/dist/konfetti.umd.js"></script>
+ <script src="https://cdn.jsdelivr.net/npm/@konfetti-js/core@0.4/dist/konfetti.min.js"></script>
```

The API is still on `window.konfetti`.

## The new look: paper confetti

Pieces now behave like paper:

- They tumble in 3D and get lighter and darker as they turn toward or away from the light.
- They slow down quickly after the burst, then fall roughly 2.5 times slower than before and sway side to side.
- They disappear once they leave the screen instead of fading out in mid-air.
- Speed and lifetime are the same on 60 Hz and 120 Hz screens; before, confetti ran twice as fast on 120 Hz. The full-screen canvas also renders sharply on high-density displays.

Bursts spread about as wide as before and rise a little higher, since paper is light, while pieces launched downward stop sooner. Presets need no changes. If you tuned `gravity` or `startVelocity` by eye for the old look, check them again.

## Options that changed

| Option | `konfetti.js` 0.2.0 | `@konfetti-js/core` | What to do |
|--------|---------------------|---------------------|------------|
| `ticks` | Lifetime, default 200 frames; pieces faded out over the second half | Longest lifetime, default 600 frames; pieces disappear when they leave the screen and only fade if `ticks` runs out first | If you lowered `ticks` to end bursts sooner, remove it or raise it, or pieces get cut off mid-fall |
| `drift` | Strength of a sideways wobble | Wind in px per frame (`1` is about 60 px per second, negative blows left) | Expect a steady sideways push; use `0` or leave it out for none |
| `decay` | Share of speed kept per frame | Same scale, now air resistance relative to the wind | Usually nothing |
| `zIndex` | Ignored, the canvas was always at 100 | Applied to the full-screen canvas | Check the stacking order if you set it |
| `colors` | 6-digit hex only; anything else became white | Any CSS color; `rgba()` transparency is kept; invalid colors draw black | Short hex and names now show as written |
| `origin` | Both `x` and `y` required | Either axis can be left out; the missing one keeps the preset's or default value | Nothing |
| `create(canvas, { useWorker })` | Accepted, did nothing | Removed | Delete `useWorker` |

## Behavior changes

- **`reset()`** also cancels `fireworks()` bursts that haven't fired yet and stops `continuous()` streams. Before, streams kept running.
- **Switching tabs** no longer breaks confetti. In 0.2.0, hiding and showing the tab while nothing was animating could stop every later `fire()` from drawing. Bursts fired while the tab is hidden are now skipped.
- **Server rendering:** `fire()` and the presets do nothing on the server. Before, they threw.
- **Canvas:** the full-screen canvas has the class `konfetti-canvas` instead of the id `konfetti-canvas` and is marked `aria-hidden`. Each `new Konfetti()` gets its own full-screen canvas instead of sharing one. Update CSS such as `#konfetti-canvas` to `.konfetti-canvas`.
- **`create(canvas)`** follows the canvas when its size changes through layout, not only on window resizes.

## TypeScript

The type names are unchanged: `KonfettiOptions`, `Origin`, `ShapeType`, `CreateOptions` and `KonfettiInstance`. `KonfettiOptions['origin']` is now `Partial<Origin>`, and `CreateOptions` no longer has `useWorker`. Types now resolve correctly with `moduleResolution: "NodeNext"`; before, they silently became `any`.

## New things you can use

None of these are required, but they replace common workarounds:

- `firePreset('snow', options)` picks a preset by name.
- `fireFromElement(button, { preset: 'explosion' })` fires from the center of an element. `originFromElement(element)` gives you that origin on its own.
- `destroy()` removes the full-screen canvas and its listeners.
- `PRESET_NAMES` lists the presets and `isPresetName(value)` checks a name.
- Instances from `create()` have `preset()` and `continuous()` too.

See the [README](./README.md) or the [docs site](https://andreabettich.github.io/konfetti.js/) for the full API.
