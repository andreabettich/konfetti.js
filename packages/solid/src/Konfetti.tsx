import { createEffect, createSignal, on } from 'solid-js';
import {
  fire,
  cannon,
  explosion,
  fireworks,
  rain,
  snow,
  sideCannons,
  pride,
  type KonfettiOptions,
} from 'konfetti.js';

export interface KonfettiProps extends KonfettiOptions {
  /** Trigger konfetti when this becomes true */
  fire?: boolean;
  /** Preset to use (overrides other options) */
  preset?: 'cannon' | 'explosion' | 'fireworks' | 'rain' | 'snow' | 'sideCannons' | 'pride';
}

/**
 * Declarative Konfetti component for Solid.js
 *
 * @example
 * ```tsx
 * function App() {
 *   const [celebrate, setCelebrate] = createSignal(false);
 *
 *   return (
 *     <>
 *       <Konfetti fire={celebrate()} particleCount={100} />
 *       <button onClick={() => setCelebrate(true)}>Celebrate!</button>
 *     </>
 *   );
 * }
 * ```
 */
export function Konfetti(props: KonfettiProps) {
  const [hasFired, setHasFired] = createSignal(false);

  createEffect(
    on(
      () => props.fire,
      (shouldFire) => {
        if (shouldFire && !hasFired()) {
          setHasFired(true);

          const { fire: _, preset, ...options } = props;

          if (preset) {
            switch (preset) {
              case 'cannon':
                cannon(options);
                break;
              case 'explosion':
                explosion(options);
                break;
              case 'fireworks':
                fireworks(options);
                break;
              case 'rain':
                rain(options);
                break;
              case 'snow':
                snow(options);
                break;
              case 'sideCannons':
                sideCannons(options);
                break;
              case 'pride':
                pride(options);
                break;
            }
          } else {
            fire(options);
          }
        }

        if (!shouldFire) {
          setHasFired(false);
        }
      }
    )
  );

  return null;
}
