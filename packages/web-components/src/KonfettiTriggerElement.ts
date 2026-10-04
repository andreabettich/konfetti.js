import { fireFromElement } from '@konfetti-js/core';
import { BaseElement, readOptions, readPreset } from './attributes';

/**
 * Custom element that fires konfetti from itself on click (or the `trigger` event)
 *
 * @example
 * ```html
 * <!-- Register the element -->
 * <script type="module">
 *   import { defineKonfettiTriggerElement } from '@konfetti-js/web-components';
 *   defineKonfettiTriggerElement();
 * </script>
 *
 * <!-- Use it -->
 * <konfetti-trigger particle-count="100" spread="70">
 *   <button>Click me!</button>
 * </konfetti-trigger>
 *
 * <!-- With preset -->
 * <konfetti-trigger preset="fireworks">
 *   <button>Fireworks!</button>
 * </konfetti-trigger>
 * ```
 */
export class KonfettiTriggerElement extends BaseElement {
  static observedAttributes = ['trigger'];

  /** The event the listener is currently attached to, if any */
  private boundTrigger: string | null = null;

  private readonly handleTrigger = (): void => {
    const options = readOptions(this);
    fireFromElement(this, { ...options, preset: readPreset(this) });
    this.dispatchEvent(new CustomEvent('konfetti-fired', { detail: options }));
  };

  connectedCallback(): void {
    this.bind();
  }

  disconnectedCallback(): void {
    this.unbind();
  }

  attributeChangedCallback(): void {
    // Runs before connectedCallback for parsed attributes; binding waits until connected
    if (this.isConnected) this.bind();
  }

  private bind(): void {
    const trigger = this.getAttribute('trigger') || 'click';
    if (trigger === this.boundTrigger) return;
    this.unbind();
    this.addEventListener(trigger, this.handleTrigger);
    this.boundTrigger = trigger;
  }

  private unbind(): void {
    if (this.boundTrigger === null) return;
    this.removeEventListener(this.boundTrigger, this.handleTrigger);
    this.boundTrigger = null;
  }
}

/** Register the konfetti-trigger custom element */
export function defineKonfettiTriggerElement(tagName = 'konfetti-trigger'): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, KonfettiTriggerElement);
  }
}
