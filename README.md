# konfetti.js

A lightweight, performant confetti animation library for the web. Zero dependencies, TypeScript-first, and smooth on any refresh rate.

[![npm version](https://img.shields.io/npm/v/@konfetti-js/core.svg)](https://www.npmjs.com/package/@konfetti-js/core)
[![CI](https://github.com/andreabettich/konfetti.js/actions/workflows/ci.yml/badge.svg)](https://github.com/andreabettich/konfetti.js/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[Live demo and docs](https://andreabettich.github.io/konfetti.js/)**

## Features

- Zero dependencies, about 4 kB gzipped
- TypeScript support with full type definitions, for ESM and CommonJS
- Time-based animation that looks the same at 60 Hz and 120 Hz, sharp on high-density screens
- Accessibility support (respects `prefers-reduced-motion`)
- Safe to import and call during server rendering
- Seven preset effects plus a continuous stream
- Framework wrappers for React, Vue, Svelte, Solid, and Web Components

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@konfetti-js/core](./packages/core) | [![npm](https://img.shields.io/npm/v/@konfetti-js/core.svg)](https://www.npmjs.com/package/@konfetti-js/core) | Core library |
| [@konfetti-js/react](./packages/react) | [![npm](https://img.shields.io/npm/v/@konfetti-js/react.svg)](https://www.npmjs.com/package/@konfetti-js/react) | React wrapper |
| [@konfetti-js/vue](./packages/vue) | [![npm](https://img.shields.io/npm/v/@konfetti-js/vue.svg)](https://www.npmjs.com/package/@konfetti-js/vue) | Vue wrapper |
| [@konfetti-js/svelte](./packages/svelte) | [![npm](https://img.shields.io/npm/v/@konfetti-js/svelte.svg)](https://www.npmjs.com/package/@konfetti-js/svelte) | Svelte wrapper |
| [@konfetti-js/solid](./packages/solid) | [![npm](https://img.shields.io/npm/v/@konfetti-js/solid.svg)](https://www.npmjs.com/package/@konfetti-js/solid) | Solid wrapper |
| [@konfetti-js/web-components](./packages/web-components) | [![npm](https://img.shields.io/npm/v/@konfetti-js/web-components.svg)](https://www.npmjs.com/package/@konfetti-js/web-components) | Web Components |

All packages are released together and share one version number.

## Installation

### Core Library

```bash
npm install @konfetti-js/core
# or
pnpm add @konfetti-js/core
```

### Framework Wrappers

Each wrapper installs `@konfetti-js/core` for you. If you also add core yourself (to import from it directly), keep it on the same version as the wrapper.

```bash
pnpm add @konfetti-js/react
pnpm add @konfetti-js/vue
pnpm add @konfetti-js/svelte
pnpm add @konfetti-js/solid
pnpm add @konfetti-js/web-components
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@konfetti-js/core@0.3/dist/konfetti.min.js"></script>
<script>
  konfetti.fire({ particleCount: 100 });
</script>
```

Or as an ES module:

```html
<script type="module">
  import { fireworks } from 'https://cdn.jsdelivr.net/npm/@konfetti-js/core@0.3/+esm';
  fireworks();
</script>
```

## Quick Start

### Vanilla JavaScript

```javascript
import { fire, cannon, fireFromElement } from '@konfetti-js/core';

// Fire confetti!
fire();

// Use a preset, and override any of its options
cannon({ colors: ['#ff48b0', '#0078bf'] });

// Fire from the button that was clicked
button.addEventListener('click', () => fireFromElement(button, { preset: 'explosion' }));
```

### React

```tsx
import { useState } from 'react';
import { useKonfetti, Konfetti } from '@konfetti-js/react';

// Hook usage
function SaveButton() {
  const { cannon } = useKonfetti();
  return <button onClick={() => cannon()}>Save</button>;
}

// Component usage: fires each time `fire` turns true
function Celebration() {
  const [done, setDone] = useState(false);
  return (
    <>
      <button onClick={() => setDone(true)}>Finish</button>
      <Konfetti fire={done} preset="fireworks" onFired={() => setDone(false)} />
    </>
  );
}
```

### Vue

```vue
<script setup>
import { useKonfetti, vKonfetti } from '@konfetti-js/vue';

const { fire } = useKonfetti();
</script>

<template>
  <!-- Composable -->
  <button @click="fire({ particleCount: 100 })">Celebrate!</button>

  <!-- Directive: fires from the element on click -->
  <button v-konfetti>Click me!</button>
  <button v-konfetti="{ preset: 'fireworks' }">Fireworks!</button>
</template>
```

### Svelte

```svelte
<script>
  import { konfettiAction, createKonfetti } from '@konfetti-js/svelte';

  const { fire } = createKonfetti();
</script>

<!-- Action: fires from the element on click -->
<button use:konfettiAction>Click me!</button>
<button use:konfettiAction={{ preset: 'fireworks' }}>Fireworks!</button>

<!-- Functions -->
<button onclick={() => fire()}>Celebrate!</button>
```

### Solid

```tsx
import { createSignal } from 'solid-js';
import { useKonfetti, Konfetti } from '@konfetti-js/solid';

// Hook usage
function SaveButton() {
  const { cannon } = useKonfetti();
  return <button onClick={() => cannon()}>Save</button>;
}

// Component usage
function Celebration() {
  const [done, setDone] = createSignal(false);
  return (
    <>
      <button onClick={() => setDone(true)}>Finish</button>
      <Konfetti fire={done()} preset="fireworks" onFired={() => setDone(false)} />
    </>
  );
}
```

### Web Components

```html
<script type="module">
  import { defineAllElements } from '@konfetti-js/web-components';
  defineAllElements();
</script>

<!-- Fires from itself when clicked -->
<konfetti-trigger preset="fireworks">
  <button>Click me!</button>
</konfetti-trigger>

<!-- Programmatic control -->
<konfetti-burst id="burst" preset="cannon" particle-count="150"></konfetti-burst>
<script>
  document.getElementById('burst').fire();
</script>
```

Attributes use kebab-case option names (`particle-count`, `start-velocity`, `origin-x`, `z-index`, comma-separated `colors` and `shapes`). `<konfetti-trigger trigger="mouseenter">` changes the event. Both elements dispatch a `konfetti-fired` event.

## API

### `fire(options?)`

Fires one burst on a full-screen canvas that is created on first use. The canvas ignores pointer events and is hidden from assistive technology.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `particleCount` | number | 50 | Number of particles to emit |
| `angle` | number | 90 | Launch angle in degrees (90 = up) |
| `spread` | number | 45 | Spread angle in degrees |
| `startVelocity` | number | 45 | Initial velocity |
| `decay` | number | 0.9 | Share of speed kept per frame (0-1) |
| `gravity` | number | 1 | Gravity strength |
| `drift` | number | 0 | Horizontal drift |
| `ticks` | number | 200 | Particle lifetime in frames at 60 fps |
| `origin` | {x, y} | {0.5, 0.5} | Spawn point (0-1 of the viewport); a missing axis keeps the preset's value |
| `colors` | string[] | festive | Any CSS colors |
| `shapes` | string[] | ['circle', 'square'] | Particle shapes |
| `scalar` | number | 1 | Size multiplier |
| `zIndex` | number | 100 | Canvas z-index |
| `disableForReducedMotion` | boolean | true | Respect user motion preference |

Invalid values (for example `NaN`) fall back to the defaults.

### Presets

```javascript
import { cannon, explosion, fireworks, rain, snow, sideCannons, pride, continuous, firePreset } from '@konfetti-js/core';

cannon();      // Burst from bottom
explosion();   // 360 degree burst
fireworks();   // Three bursts across the top half
rain();        // Falling particles
snow();        // Gentle snowfall
sideCannons(); // Burst from both sides
pride();       // Rainbow colors

firePreset('snow', { particleCount: 60 }); // Pick a preset by name

const stop = continuous({ particleCount: 8 }, 200); // A small burst every 200 ms
stop();
```

Every preset takes the same options as `fire`; anything you pass overrides the preset's values. `PRESET_NAMES` lists the names and `isPresetName(value)` checks one.

### `fireFromElement(element, options?)`

Fires from the center of an element. Pass `preset` in the options to fire a preset: single bursts (`cannon`, `explosion`, `pride`) start at the element, while screen-wide presets (`fireworks`, `rain`, `snow`, `sideCannons`) keep their positions. An `origin` you pass yourself always wins. `originFromElement(element)` returns the origin on its own.

### `reset()` and `destroy()`

`reset()` clears all particles and cancels scheduled bursts and streams. `destroy()` also removes the full-screen canvas and its listeners; the next `fire()` creates a new one.

### `create(canvas, options?)`

Draws into your own canvas instead of the full-screen one. Returns a fire function with `preset()`, `continuous()`, `reset()` and `destroy()` methods. Pass `{ resize: false }` to stop it from resizing with the window.

```javascript
import { create } from '@konfetti-js/core';

const burst = create(document.querySelector('#card-canvas'));
burst({ particleCount: 80 });
burst.preset('pride');
burst.destroy();
```

For full control there is also the `Konfetti` class, with `fire`, `preset`, `continuous`, `pause`, `resume`, `reset` and `destroy`.

## Behavior

- Animation is time-based: speed and lifetime match on 60 Hz and 120 Hz displays.
- The canvas renders at the screen's pixel density.
- Animation pauses while the tab is hidden, and bursts fired while hidden are skipped.
- On the server every function does nothing, so importing and calling them during SSR is safe.

## Performance

- **Typed-array storage**: all particle data lives in one `Float32Array`, so bursts don't allocate objects
- **Color batching**: particles are drawn grouped by color to minimize state changes
- **Direct transforms**: each particle is drawn with a single `setTransform`, without `save`/`restore`
- **Visibility API**: no frames are scheduled while the tab is hidden

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## Accessibility

By default, the library respects the user's `prefers-reduced-motion` setting. When enabled, no animations play unless you pass `disableForReducedMotion: false`.

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run the tests
pnpm check            # Format and lint (Biome)
pnpm typecheck        # Type check
pnpm check:packages   # publint, attw and require/import smoke tests (after build)
pnpm site:build       # Build the demo site into site/ (serve it with any static server)
```

Releases use [changesets](https://github.com/changesets/changesets): add one with `pnpm changeset`, and merging the generated "Version Packages" pull request publishes to npm.

## License

MIT
