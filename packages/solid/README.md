# @konfetti-js/solid

Solid hook and component for [konfetti.js](https://andreabettich.github.io/konfetti.js/). Installs `@konfetti-js/core` for you.

```bash
npm install @konfetti-js/solid
```

```tsx
import { createSignal } from 'solid-js';
import { useKonfetti, Konfetti } from '@konfetti-js/solid';

function SaveButton() {
  const { cannon } = useKonfetti();
  return <button onClick={() => cannon()}>Save</button>;
}

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

See the [full documentation](https://github.com/andreabettich/konfetti.js#readme).

MIT licensed.
