---
"@konfetti-js/core": minor
---

Fix the animation lifecycle and make bursts behave the same everywhere:

- Confetti no longer stops working after the tab was hidden and shown while nothing was animating, and pausing and resuming can no longer start a second animation loop.
- Motion and lifetime are now time-based, so confetti looks the same on 60 Hz and 120 Hz screens.
- The full-screen canvas renders at the screen's pixel density, so pieces are sharp on high-density displays.
- `zIndex` now applies to the canvas.
- Each burst keeps its own gravity and decay; a later burst no longer changes earlier pieces.
- Invalid option values (such as `NaN`) fall back to the defaults instead of clearing live particles, and `colors` accepts any CSS color.
- Presets keep their own values when an option is passed as `undefined`.
- `reset()` also cancels pending `fireworks()` bursts and running `continuous()` streams.
- `fire()` and the presets do nothing on the server instead of throwing, and bursts fired while the page is hidden are skipped.
- Each instance owns its canvas; a destroyed instance ignores further calls. The full-screen canvas is marked `aria-hidden`.

New: `firePreset(name, options)`, `fireFromElement(element, options)`, `originFromElement(element)`, `destroy()`, `isPresetName()`, `PRESET_NAMES`, and `preset()`/`continuous()` on instances from `create()`. The unused `useWorker` create option was removed.
