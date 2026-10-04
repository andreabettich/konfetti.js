import { fire, firePreset, type KonfettiOptions, type PresetName } from '@konfetti-js/core';
import { useEffect, useRef } from 'react';

export interface KonfettiProps extends KonfettiOptions {
  /** Fire when this turns true */
  fire?: boolean;
  /** Preset to fire; other props override the preset's values */
  preset?: PresetName;
  /** Called right after firing, for example to set your `fire` state back to false */
  onFired?: () => void;
}

/**
 * Declarative Konfetti component. Fires once each time `fire` turns true.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [celebrate, setCelebrate] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setCelebrate(true)}>Celebrate!</button>
 *       <Konfetti fire={celebrate} preset="fireworks" onFired={() => setCelebrate(false)} />
 *     </>
 *   );
 * }
 * ```
 */
export function Konfetti({ fire: shouldFire = false, preset, onFired, ...options }: KonfettiProps) {
  // Read the latest props when firing without re-firing every time they change
  const latest = useRef({ preset, onFired, options });
  latest.current = { preset, onFired, options };
  // Guards against firing twice for one `true`, including StrictMode's double effects
  const firedRef = useRef(false);

  useEffect(() => {
    if (!shouldFire) {
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;

    const { preset, onFired, options } = latest.current;
    if (preset) {
      firePreset(preset, options);
    } else {
      fire(options);
    }
    onFired?.();
  }, [shouldFire]);

  return null;
}
