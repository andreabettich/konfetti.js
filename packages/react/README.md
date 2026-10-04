# @konfetti-js/react

React hook and component for [konfetti.js](https://andreabettich.github.io/konfetti.js/). Installs `@konfetti-js/core` for you.

```bash
npm install @konfetti-js/react
```

```tsx
import { useState } from 'react';
import { useKonfetti, Konfetti } from '@konfetti-js/react';

function SaveButton() {
  const { cannon } = useKonfetti();
  return <button onClick={() => cannon()}>Save</button>;
}

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

`useKonfetti()` returns stable functions and stops its `continuous()` stream on unmount. `<Konfetti>` accepts every core option as a prop and fires once each time `fire` turns true. See the [full documentation](https://github.com/andreabettich/konfetti.js#readme).

MIT licensed.
