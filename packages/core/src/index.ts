/**
 * konfetti.js
 * A lightweight, performant confetti animation library
 */

export type { KonfettiInstance } from './global';
export {
  cannon,
  continuous,
  create,
  destroy,
  explosion,
  fire,
  fireFromElement,
  firePreset,
  fireworks,
  originFromElement,
  pride,
  rain,
  reset,
  sideCannons,
  snow,
} from './global';
// Class for advanced usage (pause/resume, several canvases)
export { Konfetti } from './konfetti';
export { isPresetName, PRESET_NAMES } from './presets';
export type {
  CreateOptions,
  FireFromElementOptions,
  KonfettiOptions,
  Origin,
  PresetName,
  ShapeType,
} from './types';
