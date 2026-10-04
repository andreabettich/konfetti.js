# @konfetti-js/vue

Vue composable and directive for [konfetti.js](https://andreabettich.github.io/konfetti.js/). Installs `@konfetti-js/core` for you.

```bash
npm install @konfetti-js/vue
```

```vue
<script setup>
import { useKonfetti, vKonfetti } from '@konfetti-js/vue';

const { fire } = useKonfetti();
</script>

<template>
  <button @click="fire({ particleCount: 100 })">Celebrate!</button>

  <!-- Fires from the element on click; reacts to changes in the bound options -->
  <button v-konfetti="{ preset: 'fireworks' }">Fireworks!</button>
</template>
```

The directive also accepts `trigger` (default `'click'`) and every core option. See the [full documentation](https://github.com/andreabettich/konfetti.js#readme).

MIT licensed.
