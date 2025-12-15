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

export interface KonfettiStore {
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
 * Create a konfetti store for Svelte
 *
 * @example
 * ```svelte
 * <script>
 *   import { createKonfetti } from '@konfetti/svelte';
 *
 *   const konfetti = createKonfetti();
 * </script>
 *
 * <button on:click={() => konfetti.fire({ particleCount: 100 })}>
 *   Celebrate!
 * </button>
 * ```
 */
export function createKonfetti(): KonfettiStore {
  let stopFn: (() => void) | null = null;

  return {
    fire: (options?: KonfettiOptions) => {
      konfettiFire(options);
    },
    cannon: (options?: Partial<KonfettiOptions>) => {
      konfettiCannon(options);
    },
    explosion: (options?: Partial<KonfettiOptions>) => {
      konfettiExplosion(options);
    },
    fireworks: (options?: Partial<KonfettiOptions>) => {
      konfettiFireworks(options);
    },
    rain: (options?: Partial<KonfettiOptions>) => {
      konfettiRain(options);
    },
    snow: (options?: Partial<KonfettiOptions>) => {
      konfettiSnow(options);
    },
    sideCannons: (options?: Partial<KonfettiOptions>) => {
      konfettiSideCannons(options);
    },
    pride: (options?: Partial<KonfettiOptions>) => {
      konfettiPride(options);
    },
    continuous: (options?: Partial<KonfettiOptions>, interval?: number) => {
      if (stopFn) {
        stopFn();
      }
      const stop = konfettiContinuous(options, interval);
      stopFn = stop;
      return stop;
    },
    reset: () => {
      if (stopFn) {
        stopFn();
        stopFn = null;
      }
      konfettiReset();
    },
  };
}
