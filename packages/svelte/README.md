# @konfetti-js/svelte

Svelte action and helpers for [konfetti.js](https://andreabettich.github.io/konfetti.js/). Works with Svelte 4 and 5, and installs `@konfetti-js/core` for you.

```bash
npm install @konfetti-js/svelte
```

```svelte
<script>
  import { konfettiAction, createKonfetti } from '@konfetti-js/svelte';

  const { fire } = createKonfetti();
</script>

<!-- Fires from the element on click -->
<button use:konfettiAction={{ preset: 'fireworks' }}>Fireworks!</button>

<button onclick={() => fire({ particleCount: 100 })}>Celebrate!</button>
```

When `createKonfetti()` is called during component setup, its `continuous()` stream stops when the component is destroyed. See the [full documentation](https://github.com/andreabettich/konfetti.js#readme).

MIT licensed.
