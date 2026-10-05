# @konfetti-js/core

A lightweight, zero-dependency confetti animation library for the web. Pieces behave like paper: they tumble in 3D, catch the light and float down. About 5 kB gzipped, TypeScript-first, and safe to import during server rendering.

**[Live demo and docs](https://andreabettich.github.io/konfetti.js/)**

```bash
npm install @konfetti-js/core
```

```javascript
import { fire, cannon, fireFromElement } from '@konfetti-js/core';

fire({ particleCount: 100, spread: 70 });
cannon();
button.addEventListener('click', () => fireFromElement(button, { preset: 'explosion' }));
```

Or from a CDN, which exposes `window.konfetti`:

```html
<script src="https://cdn.jsdelivr.net/npm/@konfetti-js/core@0.4/dist/konfetti.min.js"></script>
```

Wrappers are available for [React](https://www.npmjs.com/package/@konfetti-js/react), [Vue](https://www.npmjs.com/package/@konfetti-js/vue), [Svelte](https://www.npmjs.com/package/@konfetti-js/svelte), [Solid](https://www.npmjs.com/package/@konfetti-js/solid) and [Web Components](https://www.npmjs.com/package/@konfetti-js/web-components). See the [full documentation](https://github.com/andreabettich/konfetti.js#readme) for every option and preset.

MIT licensed.
