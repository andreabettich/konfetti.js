import { useCallback, useRef } from 'react';
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
 * React hook for konfetti.js
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

  const fire = useCallback((options?: KonfettiOptions) => {
    konfettiFire(options);
  }, []);

  const cannon = useCallback((options?: Partial<KonfettiOptions>) => {
    konfettiCannon(options);
  }, []);

  const explosion = useCallback((options?: Partial<KonfettiOptions>) => {
    konfettiExplosion(options);
  }, []);

  const fireworks = useCallback((options?: Partial<KonfettiOptions>) => {
    konfettiFireworks(options);
  }, []);

  const rain = useCallback((options?: Partial<KonfettiOptions>) => {
    konfettiRain(options);
  }, []);

  const snow = useCallback((options?: Partial<KonfettiOptions>) => {
    konfettiSnow(options);
  }, []);

  const sideCannons = useCallback((options?: Partial<KonfettiOptions>) => {
    konfettiSideCannons(options);
  }, []);

  const pride = useCallback((options?: Partial<KonfettiOptions>) => {
    konfettiPride(options);
  }, []);

  const continuous = useCallback((options?: Partial<KonfettiOptions>, interval?: number) => {
    // Stop any existing continuous konfetti
    if (stopRef.current) {
      stopRef.current();
    }
    const stop = konfettiContinuous(options, interval);
    stopRef.current = stop;
    return stop;
  }, []);

  const reset = useCallback(() => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    konfettiReset();
  }, []);

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
