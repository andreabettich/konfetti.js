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
import { getOwner, onCleanup } from 'solid-js';

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
  /** Start a stream (stopped automatically on cleanup); returns a stop function */
  continuous: (options?: KonfettiOptions, interval?: number) => () => void;
  /** Clear all konfetti and stop streams */
  reset: () => void;
}

/**
 * Solid.js hook for konfetti.js
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
  let stop: (() => void) | null = null;

  const stopStream = () => {
    stop?.();
    stop = null;
  };

  // Stop this component's stream when it is cleaned up
  if (getOwner()) onCleanup(stopStream);

  return {
    fire,
    cannon,
    explosion,
    fireworks,
    rain,
    snow,
    sideCannons,
    pride,
    continuous: (options?: KonfettiOptions, interval?: number) => {
      stopStream();
      stop = coreContinuous(options, interval);
      return stop;
    },
    reset: () => {
      stopStream();
      coreReset();
    },
  };
}
