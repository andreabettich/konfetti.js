import { ref, onUnmounted } from 'vue';
import {
  fire as konfettiFire,
  reset as konfettiReset,
  cannon as konfettiCannon,
  explosion as konfettiExplosion,
  fireworks as konfettiFireworks,
  rain as konfettiRain,
  snow as konfettiSnow,
  sideCannons as konfettiSideCannons,
  pride as konfettiPride,
  continuous as konfettiContinuous,
  type KonfettiOptions,
} from 'konfetti.js';

export interface UseKonfettiReturn {
  /** Fire konfetti with optional options */
  fire: (options?: KonfettiOptions) => void;
  /** Fire cannon preset */
  cannon: (options?: Partial<KonfettiOptions>) => void;
  /** Fire explosion preset */
  explosion: (options?: Partial<KonfettiOptions>) => void;
  /** Fire fireworks preset */
  fireworks: (options?: Partial<KonfettiOptions>) => void;
  /** Fire rain preset */
  rain: (options?: Partial<KonfettiOptions>) => void;
  /** Fire snow preset */
  snow: (options?: Partial<KonfettiOptions>) => void;
  /** Fire side cannons preset */
  sideCannons: (options?: Partial<KonfettiOptions>) => void;
  /** Fire pride preset */
  pride: (options?: Partial<KonfettiOptions>) => void;
  /** Start continuous konfetti, returns stop function */
  continuous: (options?: Partial<KonfettiOptions>, interval?: number) => () => void;
  /** Reset/clear all konfetti */
  reset: () => void;
}

/**
 * Vue composable for konfetti.js
 *
 * @example
 * ```vue
 * <script setup>
 * import { useKonfetti } from '@konfetti/vue';
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
  const stopFn = ref<(() => void) | null>(null);

  // Cleanup on unmount
  onUnmounted(() => {
    if (stopFn.value) {
      stopFn.value();
      stopFn.value = null;
    }
  });

  const fire = (options?: KonfettiOptions) => {
    konfettiFire(options);
  };

  const cannon = (options?: Partial<KonfettiOptions>) => {
    konfettiCannon(options);
  };

  const explosion = (options?: Partial<KonfettiOptions>) => {
    konfettiExplosion(options);
  };

  const fireworks = (options?: Partial<KonfettiOptions>) => {
    konfettiFireworks(options);
  };

  const rain = (options?: Partial<KonfettiOptions>) => {
    konfettiRain(options);
  };

  const snow = (options?: Partial<KonfettiOptions>) => {
    konfettiSnow(options);
  };

  const sideCannons = (options?: Partial<KonfettiOptions>) => {
    konfettiSideCannons(options);
  };

  const pride = (options?: Partial<KonfettiOptions>) => {
    konfettiPride(options);
  };

  const continuous = (options?: Partial<KonfettiOptions>, interval?: number) => {
    if (stopFn.value) {
      stopFn.value();
    }
    const stop = konfettiContinuous(options, interval);
    stopFn.value = stop;
    return stop;
  };

  const reset = () => {
    if (stopFn.value) {
      stopFn.value();
      stopFn.value = null;
    }
    konfettiReset();
  };

  return {
    fire,
    cannon,
    explosion,
    fireworks,
    rain,
    snow,
    sideCannons,
    pride,
    continuous,
    reset,
  };
}
