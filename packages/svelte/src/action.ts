import type { Action } from 'svelte/action';
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

export interface KonfettiActionOptions extends KonfettiOptions {
  /** Event to trigger konfetti (default: 'click') */
  trigger?: string;
  /** Preset to use */
  preset?: 'cannon' | 'explosion' | 'fireworks' | 'rain' | 'snow' | 'sideCannons' | 'pride';
}

/**
 * Svelte action for konfetti.js
 *
 * @example
 * ```svelte
 * <script>
 *   import { konfettiAction } from '@konfetti/svelte';
 * </script>
 *
 * <!-- Basic usage -->
 * <button use:konfettiAction>Click me!</button>
 *
 * <!-- With options -->
 * <button use:konfettiAction={{ particleCount: 100, spread: 70 }}>
 *   Celebrate!
 * </button>
 *
 * <!-- With preset -->
 * <button use:konfettiAction={{ preset: 'fireworks' }}>
 *   Fireworks!
 * </button>
 * ```
 */
export const konfettiAction: Action<HTMLElement, KonfettiActionOptions | undefined> = (
  node,
  options = {}
) => {
  let currentOptions = options;

  const handler = () => {
    const rect = node.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    const { preset, trigger: _, ...konfettiOptions } = currentOptions;

    if (preset) {
      switch (preset) {
        case 'cannon':
          cannon({ origin, ...konfettiOptions });
          break;
        case 'explosion':
          explosion({ origin, ...konfettiOptions });
          break;
        case 'fireworks':
          fireworks(konfettiOptions);
          break;
        case 'rain':
          rain(konfettiOptions);
          break;
        case 'snow':
          snow(konfettiOptions);
          break;
        case 'sideCannons':
          sideCannons(konfettiOptions);
          break;
        case 'pride':
          pride({ origin, ...konfettiOptions });
          break;
      }
    } else {
      fire({ origin, ...konfettiOptions });
    }
  };

  const trigger = currentOptions.trigger ?? 'click';
  node.addEventListener(trigger, handler);

  return {
    update(newOptions = {}) {
      const oldTrigger = currentOptions.trigger ?? 'click';
      const newTrigger = newOptions.trigger ?? 'click';

      if (oldTrigger !== newTrigger) {
        node.removeEventListener(oldTrigger, handler);
        node.addEventListener(newTrigger, handler);
      }

      currentOptions = newOptions;
    },
    destroy() {
      const trigger = currentOptions.trigger ?? 'click';
      node.removeEventListener(trigger, handler);
    },
  };
};
