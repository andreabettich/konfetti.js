import { fire, firePreset, type KonfettiOptions, type PresetName } from '@konfetti-js/core';
import { createEffect, on } from 'solid-js';

export interface KonfettiProps extends KonfettiOptions {
  /** Fire when this turns true */
  fire?: boolean;
  /** Preset to fire; other props override the preset's values */
  preset?: PresetName;
  /** Called right after firing, for example to set your `fire` signal back to false */
  onFired?: () => void;
}

/**
 * Declarative Konfetti component for Solid.js. Fires once each time `fire` turns true.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [celebrate, setCelebrate] = createSignal(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setCelebrate(true)}>Celebrate!</button>
 *       <Konfetti fire={celebrate()} preset="fireworks" onFired={() => setCelebrate(false)} />
 *     </>
 *   );
 * }
 * ```
 */
export function Konfetti(props: KonfettiProps) {
  createEffect(
    on(
      () => props.fire,
      (shouldFire) => {
        if (!shouldFire) return;

        // Reading props here is untracked, so changing them later does not re-fire
        const { fire: _fire, preset, onFired, ...options } = props;
        if (preset) {
          firePreset(preset, options);
        } else {
          fire(options);
        }
        onFired?.();
      }
    )
  );

  return null;
}
