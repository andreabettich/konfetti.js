import { type FireFromElementOptions, fireFromElement } from '@konfetti-js/core';
import type { Action } from 'svelte/action';

export interface KonfettiActionOptions extends FireFromElementOptions {
  /** Event to trigger konfetti (default: 'click') */
  trigger?: string;
}

/**
 * Svelte action for konfetti.js. Fires from the element on click (or `trigger`).
 *
 * @example
 * ```svelte
 * <script>
 *   import { konfettiAction } from '@konfetti-js/svelte';
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
  initialOptions = {}
) => {
  let current = initialOptions;
  let trigger = current.trigger ?? 'click';

  const handler = () => {
    const { trigger: _trigger, ...options } = current;
    fireFromElement(node, options);
  };

  node.addEventListener(trigger, handler);

  return {
    update(nextOptions = {}) {
      current = nextOptions;
      const nextTrigger = nextOptions.trigger ?? 'click';
      if (nextTrigger !== trigger) {
        node.removeEventListener(trigger, handler);
        node.addEventListener(nextTrigger, handler);
        trigger = nextTrigger;
      }
    },
    destroy() {
      node.removeEventListener(trigger, handler);
    },
  };
};
