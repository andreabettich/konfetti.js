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

/**
 * Custom element that fires konfetti on click
 *
 * @example
 * ```html
 * <!-- Register the element -->
 * <script type="module">
 *   import { defineKonfettiTriggerElement } from '@konfetti/web-components';
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
export class KonfettiTriggerElement extends HTMLElement {
  static observedAttributes = [
    'particle-count',
    'angle',
    'spread',
    'start-velocity',
    'decay',
    'gravity',
    'drift',
    'ticks',
    'colors',
    'shapes',
    'scalar',
    'preset',
    'trigger',
  ];

  private handler: ((e: Event) => void) | null = null;

  connectedCallback(): void {
    this.setupHandler();
  }

  disconnectedCallback(): void {
    this.removeHandler();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'trigger') {
      this.removeHandler();
      this.setupHandler();
    }
  }

  private setupHandler(): void {
    const trigger = this.getAttribute('trigger') ?? 'click';

    this.handler = () => {
      const rect = this.getBoundingClientRect();
      const origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      };

      const options = { ...this.getOptions(), origin };
      const preset = this.getAttribute('preset');

      if (preset) {
        switch (preset) {
          case 'cannon':
            cannon(options);
            break;
          case 'explosion':
            explosion(options);
            break;
          case 'fireworks':
            fireworks(this.getOptions());
            break;
          case 'rain':
            rain(this.getOptions());
            break;
          case 'snow':
            snow(this.getOptions());
            break;
          case 'sideCannons':
            sideCannons(this.getOptions());
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
    };

    this.addEventListener(trigger, this.handler);
  }

  private removeHandler(): void {
    if (this.handler) {
      const trigger = this.getAttribute('trigger') ?? 'click';
      this.removeEventListener(trigger, this.handler);
      this.handler = null;
    }
  }

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
}

/** Register the konfetti-trigger custom element */
export function defineKonfettiTriggerElement(tagName = 'konfetti-trigger'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, KonfettiTriggerElement);
  }
}
