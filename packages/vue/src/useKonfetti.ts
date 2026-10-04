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
import { getCurrentScope, onScopeDispose } from 'vue';

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
 * Vue composable for konfetti.js
 *
 * @example
 * ```vue
 * <script setup>
 * import { useKonfetti } from '@konfetti-js/vue';
 *
 * const { fire, cannon } = useKonfetti();
 * </script>
 *
 * <template>
 *   <button @click="fire({ particleCount: 100 })">Celebrate!</button>
 * </template>
 * ```
 */
export function useKonfetti(): UseKonfettiReturn {
  let stop: (() => void) | null = null;

  const stopStream = () => {
    stop?.();
    stop = null;
  };

  // Stop this component's stream when its scope is disposed (on unmount)
  if (getCurrentScope()) onScopeDispose(stopStream);

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
