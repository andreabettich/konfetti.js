# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-15

### Added

- Initial release
- Core confetti animation with Canvas 2D
- Particle shapes: circle, square
- Physics: gravity, decay, drift, rotation
- 8 preset effects: cannon, explosion, fireworks, rain, snow, sideCannons, pride, continuous
- TypeScript support with full type definitions
- Accessibility: respects `prefers-reduced-motion`
- Performance optimizations: Float32Array storage, color batching, object pooling
- Visibility API integration (pause when tab hidden)
- ESM and UMD builds
- Interactive demo page
- Monorepo structure with pnpm workspaces
- Framework wrappers:
  - `@konfetti/react` - React hook and component
  - `@konfetti/vue` - Vue composable and directive
  - `@konfetti/svelte` - Svelte action and store
  - `@konfetti/solid` - Solid.js hook and component
  - `@konfetti/web-components` - Custom elements

### API

- Named exports only (no default export) for better tree-shaking
- Core functions: `fire`, `reset`, `create`
- Preset functions: `cannon`, `explosion`, `fireworks`, `rain`, `snow`, `sideCannons`, `pride`, `continuous`

```javascript
// Usage
import { fire, fireworks, cannon } from 'konfetti.js';

fire({ particleCount: 100 });
fireworks();
```
