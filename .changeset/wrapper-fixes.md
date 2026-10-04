---
"@konfetti-js/react": minor
"@konfetti-js/vue": minor
"@konfetti-js/svelte": minor
"@konfetti-js/solid": minor
"@konfetti-js/web-components": minor
---

Fix wrapper bugs and share preset handling through core:

- React: `<Konfetti preset>` no longer loses the preset's settings, fires once per `true` even in StrictMode, and supports the documented `onFired` callback. `useKonfetti()` stops its stream on unmount and returns stable functions.
- Solid: `<Konfetti>` supports `onFired`.
- Vue: `v-konfetti` picks up changes to its bound options, including `trigger`. `useKonfetti()` cleans up through `onScopeDispose`.
- Svelte: `createKonfetti()` stops its stream when the component is destroyed.
- Web Components: `<konfetti-trigger>` no longer fires twice per click or keeps an old listener when `trigger` changes. Invalid numeric attributes are ignored, a `z-index` attribute is supported, and importing the package during server rendering no longer throws.
