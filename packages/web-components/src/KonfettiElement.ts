import {
  fire,
  reset,
  cannon,
  explosion,
  fireworks,
  rain,
  snow,
  sideCannons,
  pride,
  type KonfettiOptions,
} from 'konfetti.js';

/**
 * Custom element for firing konfetti
 *
 * @example
 * ```html
 * <!-- Register the element -->
 * <script type="module">
 *   import { defineKonfettiElement } from '@konfetti/web-components';
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
export class KonfettiElement extends HTMLElement {
  static observedAttributes = [
    'particle-count',
    'angle',
    'spread',
    'start-velocity',
    'decay',
    'gravity',
    'drift',
    'ticks',
    'origin-x',
    'origin-y',
    'colors',
    'shapes',
    'scalar',
    'preset',
  ];

  private getOptions(): KonfettiOptions {
    const options: KonfettiOptions = {};

    const particleCount = this.getAttribute('particle-count');
    if (particleCount) options.particleCount = parseInt(particleCount, 10);

    const angle = this.getAttribute('angle');
    if (angle) options.angle = parseInt(angle, 10);

    const spread = this.getAttribute('spread');
    if (spread) options.spread = parseInt(spread, 10);

    const startVelocity = this.getAttribute('start-velocity');
    if (startVelocity) options.startVelocity = parseInt(startVelocity, 10);

    const decay = this.getAttribute('decay');
    if (decay) options.decay = parseFloat(decay);

    const gravity = this.getAttribute('gravity');
    if (gravity) options.gravity = parseFloat(gravity);

    const drift = this.getAttribute('drift');
    if (drift) options.drift = parseFloat(drift);

    const ticks = this.getAttribute('ticks');
    if (ticks) options.ticks = parseInt(ticks, 10);

    const originX = this.getAttribute('origin-x');
    const originY = this.getAttribute('origin-y');
    if (originX || originY) {
      options.origin = {
        x: originX ? parseFloat(originX) : 0.5,
        y: originY ? parseFloat(originY) : 0.5,
      };
    }

    const colors = this.getAttribute('colors');
    if (colors) {
      options.colors = colors.split(',').map((c) => c.trim());
    }

    const shapes = this.getAttribute('shapes');
    if (shapes) {
      options.shapes = shapes.split(',').map((s) => s.trim()) as KonfettiOptions['shapes'];
    }

    const scalar = this.getAttribute('scalar');
    if (scalar) options.scalar = parseFloat(scalar);

    return options;
  }

  /** Fire konfetti with element's configured options */
  fire(overrides?: KonfettiOptions): void {
    const preset = this.getAttribute('preset');
    const options = { ...this.getOptions(), ...overrides };

    if (preset) {
      switch (preset) {
        case 'cannon':
          cannon(options);
          break;
        case 'explosion':
          explosion(options);
          break;
        case 'fireworks':
          fireworks(options);
          break;
        case 'rain':
          rain(options);
          break;
        case 'snow':
          snow(options);
          break;
        case 'sideCannons':
          sideCannons(options);
          break;
        case 'pride':
          pride(options);
          break;
        default:
          fire(options);
      }
    } else {
      fire(options);
    }

    this.dispatchEvent(new CustomEvent('konfetti-fired', { detail: options }));
  }

  /** Reset/clear all konfetti */
  reset(): void {
    reset();
  }
}

/** Register the konfetti-burst custom element */
export function defineKonfettiElement(tagName = 'konfetti-burst'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, KonfettiElement);
  }
}
