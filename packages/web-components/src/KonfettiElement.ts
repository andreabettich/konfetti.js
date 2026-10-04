import { fire, firePreset, type KonfettiOptions, reset } from '@konfetti-js/core';
import { BaseElement, readOptions, readPreset } from './attributes';

/**
 * Custom element for firing konfetti from your own code
 *
 * @example
 * ```html
 * <!-- Register the element -->
 * <script type="module">
 *   import { defineKonfettiElement } from '@konfetti-js/web-components';
 *   defineKonfettiElement();
 * </script>
 *
 * <!-- Use it -->
 * <konfetti-burst
 *   particle-count="100"
 *   spread="70"
 *   preset="fireworks"
 * ></konfetti-burst>
 *
 * <!-- Trigger via JavaScript -->
 * <script>
 *   document.querySelector('konfetti-burst').fire();
 * </script>
 * ```
 */
export class KonfettiElement extends BaseElement {
  /** Fire konfetti with the element's attributes, optionally overridden */
  fire(overrides?: KonfettiOptions): void {
    const options = { ...readOptions(this), ...overrides };
    const preset = readPreset(this);

    if (preset) {
      firePreset(preset, options);
    } else {
      fire(options);
    }

    this.dispatchEvent(new CustomEvent('konfetti-fired', { detail: options }));
  }

  /** Clear all konfetti */
  reset(): void {
    reset();
  }
}

/** Register the konfetti-burst custom element */
export function defineKonfettiElement(tagName = 'konfetti-burst'): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, KonfettiElement);
  }
}
