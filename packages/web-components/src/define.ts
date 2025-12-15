import { defineKonfettiElement } from './KonfettiElement';
import { defineKonfettiTriggerElement } from './KonfettiTriggerElement';

/**
 * Register all konfetti custom elements
 *
 * @example
 * ```html
 * <script type="module">
 *   import { defineAllElements } from '@konfetti/web-components';
 *   defineAllElements();
 * </script>
 *
 * <konfetti-trigger preset="fireworks">
 *   <button>Click me!</button>
 * </konfetti-trigger>
 * ```
 */
export function defineAllElements(): void {
  defineKonfettiElement();
  defineKonfettiTriggerElement();
}
