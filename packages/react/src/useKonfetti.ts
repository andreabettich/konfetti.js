import {
  cannon,
  continuous as coreContinuous,
  reset as coreReset,
  explosion,
  fire,
  fireworks,
  type KonfettiOptions,
  pride,
  rain,
  sideCannons,
  snow,
} from '@konfetti-js/core';
import { useEffect, useMemo, useRef } from 'react';

type FireFn = (options?: KonfettiOptions) => void;

export interface UseKonfettiReturn {
  /** Fire konfetti with optional options */
  fire: FireFn;
  /** Fire cannon preset */
  cannon: FireFn;
  /** Fire explosion preset */
  explosion: FireFn;
  /** Fire fireworks preset */
  fireworks: FireFn;
  /** Fire rain preset */
  rain: FireFn;
  /** Fire snow preset */
  snow: FireFn;
  /** Fire side cannons preset */
  sideCannons: FireFn;
  /** Fire pride preset */
  pride: FireFn;
  /** Start a stream (stopped automatically on unmount); returns a stop function */
  continuous: (options?: KonfettiOptions, interval?: number) => () => void;
  /** Clear all konfetti and stop streams */
  reset: () => void;
}

/**
 * React hook for konfetti.js. The returned functions are stable across renders.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { fire, cannon } = useKonfetti();
 *
 *   return (
 *     <button onClick={() => fire({ particleCount: 100 })}>
 *       Celebrate!
 *     </button>
 *   );
 * }
 * ```
 */
export function useKonfetti(): UseKonfettiReturn {
  const stopRef = useRef<(() => void) | null>(null);

  // Stop this component's stream when it unmounts
  useEffect(
    () => () => {
      stopRef.current?.();
      stopRef.current = null;
    },
    []
  );

  return useMemo(
    () => ({
      fire,
      cannon,
      explosion,
      fireworks,
      rain,
      snow,
      sideCannons,
      pride,
      continuous: (options?: KonfettiOptions, interval?: number) => {
        stopRef.current?.();
        const stop = coreContinuous(options, interval);
        stopRef.current = stop;
        return stop;
      },
      reset: () => {
        stopRef.current?.();
        stopRef.current = null;
        coreReset();
      },
    }),
    []
  );
}
