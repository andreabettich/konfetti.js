/**
 * konfetti.js
 * A lightweight, performant confetti animation library
 */

export type { KonfettiInstance } from './konfetti';
// Re-export classes for advanced usage
export { create, fire, Konfetti, reset } from './konfetti';
export {
  cannon,
  continuous,
  explosion,
  fireworks,
  pride,
  rain,
  sideCannons,
  snow,
} from './presets';
// Re-export types
export type {
  CreateOptions,
  KonfettiOptions,
  Origin,
  ShapeType,
} from './types';
