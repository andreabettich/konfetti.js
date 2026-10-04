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
import { onDestroy } from 'svelte';

type FireFn = (options?: KonfettiOptions) => void;

export interface KonfettiStore {
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
  /** Start a stream (stopped automatically on destroy); returns a stop function */
  continuous: (options?: KonfettiOptions, interval?: number) => () => void;
  /** Clear all konfetti and stop streams */
  reset: () => void;
}

/**
 * Create konfetti controls for Svelte. When called while a component
 * initializes, its stream stops automatically when the component is destroyed.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createKonfetti } from '@konfetti-js/svelte';
 *
 *   const konfetti = createKonfetti();
 * </script>
 *
 * <button onclick={() => konfetti.fire({ particleCount: 100 })}>
 *   Celebrate!
 * </button>
 * ```
 */
export function createKonfetti(): KonfettiStore {
  let stop: (() => void) | null = null;

  const stopStream = () => {
    stop?.();
    stop = null;
  };

  try {
    onDestroy(stopStream);
  } catch {
    // Called outside component initialization: nothing to tie the stream to
  }

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
