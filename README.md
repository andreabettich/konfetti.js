# konfetti.js

A lightweight, performant confetti animation library for the web. Zero dependencies, TypeScript-first, and optimized for 60fps animations.

[![npm version](https://img.shields.io/npm/v/@konfetti-js/core.svg)](https://www.npmjs.com/package/@konfetti-js/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Zero dependencies
- TypeScript support with full type definitions
- Performant (60fps with 100+ particles)
- Accessibility support (respects `prefers-reduced-motion`)
- Small bundle size (< 7KB gzipped)
- Multiple preset effects
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

## Installation

### Core Library

```bash
npm install @konfetti-js/core
# or
pnpm add @konfetti-js/core
```

### Framework Wrappers

```bash
# React
pnpm add @konfetti-js/react @konfetti-js/core

# Vue
pnpm add @konfetti-js/vue @konfetti-js/core

# Svelte
pnpm add @konfetti-js/svelte @konfetti-js/core

# Solid
pnpm add @konfetti-js/solid @konfetti-js/core

# Web Components
pnpm add @konfetti-js/web-components @konfetti-js/core
```

## Quick Start

### Vanilla JavaScript

```javascript
import { fire, fireworks, cannon, explosion } from '@konfetti-js/core';

// Fire confetti!
fire();

// Use presets
fireworks();
cannon();
explosion();
```

### React

```tsx
import { useKonfetti, Konfetti } from '@konfetti-js/react';

// Hook usage
function App() {
  const { fire, fireworks } = useKonfetti();
  return <button onClick={() => fire()}>Celebrate!</button>;
}

// Component usage
function App() {
  const [fire, setFire] = useState(false);
  return (
    <>
      <button onClick={() => setFire(true)}>Celebrate!</button>
      <Konfetti fire={fire} onFired={() => setFire(false)} />
    </>
  );
}
```

### Vue

```vue
<script setup>
import { useKonfetti, vKonfetti } from '@konfetti-js/vue';

const { fire, fireworks } = useKonfetti();
</script>

<template>
  <!-- Hook usage -->
  <button @click="fire()">Celebrate!</button>

  <!-- Directive usage -->
  <button v-konfetti>Click me!</button>
  <button v-konfetti="{ preset: 'fireworks' }">Fireworks!</button>
</template>
```

### Svelte

```svelte
<script>
  import { konfettiAction, createKonfetti } from '@konfetti-js/svelte';

  const { fire, fireworks } = createKonfetti();
</script>

<!-- Action usage -->
<button use:konfettiAction>Click me!</button>
<button use:konfettiAction={{ preset: 'fireworks' }}>Fireworks!</button>

<!-- Store usage -->
<button on:click={() => fire()}>Celebrate!</button>
```

### Solid

```tsx
import { useKonfetti, Konfetti } from '@konfetti-js/solid';

// Hook usage
function App() {
  const { fire, fireworks } = useKonfetti();
  return <button onClick={() => fire()}>Celebrate!</button>;
}

// Component usage
function App() {
  const [fire, setFire] = createSignal(false);
  return (
    <>
      <button onClick={() => setFire(true)}>Celebrate!</button>
      <Konfetti fire={fire()} onFired={() => setFire(false)} />
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

<!-- Click trigger -->
<konfetti-trigger preset="fireworks">
  <button>Click me!</button>
</konfetti-trigger>

<!-- Programmatic control -->
<konfetti-burst id="burst" preset="cannon"></konfetti-burst>
<script>
  document.getElementById('burst').fire();
</script>
```

## API

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `particleCount` | number | 50 | Number of particles to emit |
| `angle` | number | 90 | Launch angle (90 = up) |
| `spread` | number | 45 | Spread angle in degrees |
| `startVelocity` | number | 45 | Initial velocity |
| `decay` | number | 0.9 | Velocity decay (0-1) |
| `gravity` | number | 1 | Gravity strength |
| `drift` | number | 0 | Horizontal drift |
| `ticks` | number | 200 | Particle lifetime |
| `origin` | {x, y} | {0.5, 0.5} | Spawn point (0-1) |
| `colors` | string[] | festive | Array of hex colors |
| `shapes` | string[] | ['circle', 'square'] | Particle shapes |
| `scalar` | number | 1 | Size multiplier |
| `zIndex` | number | 100 | Canvas z-index |
| `disableForReducedMotion` | boolean | true | Respect user motion preference |

### Presets

```javascript
import { cannon, explosion, fireworks, rain, snow, sideCannons, pride, continuous } from '@konfetti-js/core';

cannon();      // Burst from bottom
explosion();   // 360 degree burst
fireworks();   // Multiple bursts
rain();        // Falling particles
snow();        // Gentle snowfall
sideCannons(); // Burst from both sides
pride();       // Rainbow colors
continuous();  // Ongoing stream (returns stop function)
```

## Performance

The library uses several optimizations for smooth 60fps animations:

- **Float32Array storage** - Particle data stored in typed arrays
- **Object pooling** - Reuses particle objects to avoid GC
- **Color batching** - Groups particles by color to minimize state changes
- **Visibility API** - Pauses animation when tab is hidden
- **requestAnimationFrame** - Smooth, vsync-aligned updates

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## Accessibility

By default, the library respects the user's `prefers-reduced-motion` setting. When enabled, no animations will play.

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Lint
pnpm run lint

# Type check
pnpm run typecheck
```

## License

MIT
