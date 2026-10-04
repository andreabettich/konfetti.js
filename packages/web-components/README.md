# @konfetti-js/web-components

Custom elements for [konfetti.js](https://andreabettich.github.io/konfetti.js/), usable in any framework or plain HTML. Installs `@konfetti-js/core` for you and is safe to import during server rendering.

```bash
npm install @konfetti-js/web-components
```

```html
<script type="module">
  import { defineAllElements } from '@konfetti-js/web-components';
  defineAllElements();
</script>

<!-- Fires from itself when clicked -->
<konfetti-trigger preset="fireworks">
  <button>Click me!</button>
</konfetti-trigger>

<!-- Fire from your own code -->
<konfetti-burst id="burst" preset="cannon" particle-count="150"></konfetti-burst>
<script>
  document.getElementById('burst').fire();
</script>
```

Attributes use kebab-case option names (`particle-count`, `start-velocity`, `origin-x`, `z-index`, comma-separated `colors`). `trigger` changes the event for `<konfetti-trigger>`, and both elements dispatch `konfetti-fired`. See the [full documentation](https://github.com/andreabettich/konfetti.js#readme).

MIT licensed.
