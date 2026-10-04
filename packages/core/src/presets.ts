import type { KonfettiOptions, PresetName } from './types';

/**
 * One burst of a preset, fired `delay` ms after the preset starts
 */
interface PresetBurst {
  delay?: number;
  options: KonfettiOptions;
}

interface PresetDefinition {
  bursts: readonly PresetBurst[];
  /**
   * Whether the preset is a single burst that can be moved to a caller's origin
   * (for example an element). Screen-wide presets keep their own positions.
   */
  followsOrigin: boolean;
}

const FIREWORK_COLORS = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
const FIREWORK: KonfettiOptions = {
  particleCount: 80,
  angle: 90,
  spread: 360,
  startVelocity: 35,
  decay: 0.91,
  gravity: 1,
  colors: FIREWORK_COLORS,
};

const PRIDE_COLORS = [
  '#e40303', // red
  '#ff8c00', // orange
  '#ffed00', // yellow
  '#008026', // green
  '#004dff', // blue
  '#750787', // purple
];

/**
 * Built-in preset effects
 */
export const PRESETS: Readonly<Record<PresetName, PresetDefinition>> = {
  // Burst of confetti from bottom center shooting up
  cannon: {
    followsOrigin: true,
    bursts: [
      {
        options: {
          particleCount: 100,
          angle: 90,
          spread: 70,
          startVelocity: 50,
          decay: 0.91,
          gravity: 1,
          origin: { x: 0.5, y: 1 },
        },
      },
    ],
  },
  // 360 degree burst from center
  explosion: {
    followsOrigin: true,
    bursts: [
      {
        options: {
          particleCount: 150,
          angle: 90,
          spread: 360,
          startVelocity: 40,
          decay: 0.92,
          gravity: 0.8,
          origin: { x: 0.5, y: 0.5 },
        },
      },
    ],
  },
  // Three bursts across the top half
  fireworks: {
    followsOrigin: false,
    bursts: [
      { delay: 0, options: { ...FIREWORK, origin: { x: 0.3, y: 0.4 } } },
      { delay: 150, options: { ...FIREWORK, origin: { x: 0.5, y: 0.3 } } },
      { delay: 300, options: { ...FIREWORK, origin: { x: 0.7, y: 0.4 } } },
    ],
  },
  // Particles falling from the top
  rain: {
    followsOrigin: false,
    bursts: [
      {
        options: {
          particleCount: 50,
          angle: 270,
          spread: 60,
          startVelocity: 10,
          decay: 0.95,
          gravity: 0.5,
          drift: 0,
          origin: { x: 0.5, y: 0 },
          ticks: 900,
        },
      },
    ],
  },
  // Gentle falling white flakes
  snow: {
    followsOrigin: false,
    bursts: [
      {
        options: {
          particleCount: 30,
          angle: 270,
          spread: 120,
          startVelocity: 5,
          decay: 0.98,
          gravity: 0.3,
          drift: 1,
          origin: { x: 0.5, y: -0.1 },
          ticks: 1200,
          colors: ['#ffffff', '#e0e0e0', '#c0c0c0'],
          shapes: ['circle'],
        },
      },
    ],
  },
  // Bursts from both sides
  sideCannons: {
    followsOrigin: false,
    bursts: [
      {
        options: {
          particleCount: 50,
          angle: 60,
          spread: 55,
          startVelocity: 50,
          origin: { x: 0, y: 0.7 },
        },
      },
      {
        options: {
          particleCount: 50,
          angle: 120,
          spread: 55,
          startVelocity: 50,
          origin: { x: 1, y: 0.7 },
        },
      },
    ],
  },
  // Rainbow colors
  pride: {
    followsOrigin: true,
    bursts: [
      {
        options: {
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors: PRIDE_COLORS,
        },
      },
    ],
  },
};

/**
 * Defaults for continuous(): a small burst from the bottom every interval
 */
export const CONTINUOUS_DEFAULTS: KonfettiOptions = {
  particleCount: 10,
  angle: 90,
  spread: 55,
  startVelocity: 45,
  origin: { x: 0.5, y: 1 },
};

/**
 * Names of all built-in presets
 */
export const PRESET_NAMES = Object.keys(PRESETS) as readonly PresetName[];

/**
 * Whether a value names a built-in preset (useful for attribute or prop values)
 */
export function isPresetName(value: unknown): value is PresetName {
  return typeof value === 'string' && (PRESET_NAMES as readonly string[]).includes(value);
}
