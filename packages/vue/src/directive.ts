import { type FireFromElementOptions, fireFromElement } from '@konfetti-js/core';
import type { Directive } from 'vue';

export interface KonfettiDirectiveOptions extends FireFromElementOptions {
  /** Event to trigger konfetti (default: 'click') */
  trigger?: string;
}

interface DirectiveState {
  options: KonfettiDirectiveOptions;
  trigger: string;
  handler: () => void;
}

const states = new WeakMap<HTMLElement, DirectiveState>();

function bindTrigger(el: HTMLElement, state: DirectiveState): void {
  const trigger = state.options.trigger ?? 'click';
  if (trigger === state.trigger) return;
  el.removeEventListener(state.trigger, state.handler);
  el.addEventListener(trigger, state.handler);
  state.trigger = trigger;
}

/**
 * Vue directive for konfetti.js. Fires from the element on click (or `trigger`),
 * and picks up changes to the bound options.
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
export const vKonfetti: Directive<HTMLElement, KonfettiDirectiveOptions | undefined> = {
  mounted(el, binding) {
    const state: DirectiveState = {
      options: binding.value ?? {},
      trigger: binding.value?.trigger ?? 'click',
      handler: () => {
        const { trigger: _trigger, ...options } = state.options;
        fireFromElement(el, options);
      },
    };
    el.addEventListener(state.trigger, state.handler);
    states.set(el, state);
  },

  updated(el, binding) {
    const state = states.get(el);
    if (!state) return;
    state.options = binding.value ?? {};
    bindTrigger(el, state);
  },

  unmounted(el) {
    const state = states.get(el);
    if (!state) return;
    el.removeEventListener(state.trigger, state.handler);
    states.delete(el);
  },
};
