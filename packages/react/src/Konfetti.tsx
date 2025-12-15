import { useEffect, useMemo, useRef } from 'react';
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
 * Declarative Konfetti component
 *
 * @example
 * ```tsx
 * function App() {
 *   const [celebrate, setCelebrate] = useState(false);
 *
 *   return (
 *     <>
 *       <Konfetti fire={celebrate} particleCount={100} />
 *       <button onClick={() => setCelebrate(true)}>Celebrate!</button>
 *     </>
 *   );
 * }
 * ```
 */
export function Konfetti({
  fire: shouldFire,
  preset,
  particleCount,
  angle,
  spread,
  startVelocity,
  decay,
  gravity,
  drift,
  ticks,
  origin,
  colors,
  shapes,
  scalar,
  zIndex,
  disableForReducedMotion,
}: KonfettiProps) {
  const hasFired = useRef(false);

  const options = useMemo<KonfettiOptions>(
    () => ({
      particleCount,
      angle,
      spread,
      startVelocity,
      decay,
      gravity,
      drift,
      ticks,
      origin,
      colors,
      shapes,
      scalar,
      zIndex,
      disableForReducedMotion,
    }),
    [
      particleCount,
      angle,
      spread,
      startVelocity,
      decay,
      gravity,
      drift,
      ticks,
      origin,
      colors,
      shapes,
      scalar,
      zIndex,
      disableForReducedMotion,
    ]
  );

  useEffect(() => {
    if (shouldFire && !hasFired.current) {
      hasFired.current = true;

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
      hasFired.current = false;
    }
  }, [shouldFire, preset, options]);

  return null;
}
