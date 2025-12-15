import type { Directive, DirectiveBinding } from 'vue';
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

export interface KonfettiDirectiveOptions extends KonfettiOptions {
  /** Event to trigger konfetti (default: 'click') */
  trigger?: string;
  /** Preset to use */
  preset?: 'cannon' | 'explosion' | 'fireworks' | 'rain' | 'snow' | 'sideCannons' | 'pride';
}

interface KonfettiHTMLElement extends HTMLElement {
  _konfettiHandler?: EventListener;
  _konfettiTrigger?: string;
}

/**
 * Vue directive for konfetti.js
 *
 * @example
 * ```vue
 * <template>
 *   <!-- Basic usage -->
 *   <button v-konfetti>Click me!</button>
 *
 *   <!-- With options -->
 *   <button v-konfetti="{ particleCount: 100, spread: 70 }">
 *     Celebrate!
 *   </button>
 *
 *   <!-- With preset -->
 *   <button v-konfetti="{ preset: 'fireworks' }">
 *     Fireworks!
 *   </button>
 * </template>
 * ```
 */
export const vKonfetti: Directive<KonfettiHTMLElement, KonfettiDirectiveOptions | undefined> = {
  mounted(
    el: KonfettiHTMLElement,
    binding: DirectiveBinding<KonfettiDirectiveOptions | undefined>
  ) {
    const options = binding.value ?? {};
    const trigger = options.trigger ?? 'click';

    const handler = () => {
      const rect = el.getBoundingClientRect();
      const origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      };

      const { preset, trigger: _, ...konfettiOptions } = options;

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

    el.addEventListener(trigger, handler);
    el._konfettiHandler = handler;
    el._konfettiTrigger = trigger;
  },

  unmounted(el: KonfettiHTMLElement) {
    const handler = el._konfettiHandler;
    const trigger = el._konfettiTrigger;
    if (handler && trigger) {
      el.removeEventListener(trigger, handler);
    }
  },
};
