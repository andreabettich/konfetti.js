/**
 * Shape type for particles
 */
export type ShapeType = 'circle' | 'square';

/**
 * Origin point (0-1 relative to canvas dimensions)
 */
export interface Origin {
  x: number;
  y: number;
}

/**
 * Configuration options for konfetti
 */
export interface KonfettiOptions {
  /** Number of particles to emit (default: 50) */
  particleCount?: number;
  /** Launch angle in degrees, 90 is straight up (default: 90) */
  angle?: number;
  /** Spread angle in degrees (default: 45) */
  spread?: number;
  /** Initial velocity in pixels per frame at 60 fps (default: 45) */
  startVelocity?: number;
  /** Velocity kept per frame at 60 fps, 0-1, lower = faster slowdown (default: 0.9) */
  decay?: number;
  /** Gravity strength (default: 1) */
  gravity?: number;
  /** Horizontal drift (default: 0) */
  drift?: number;
  /** Particle lifetime in frames at 60 fps (default: 200) */
  ticks?: number;
  /**
   * Spawn origin point, 0-1 relative (default: { x: 0.5, y: 0.5 }). An axis you
   * leave out keeps the preset's or default value.
   */
  origin?: Partial<Origin>;
  /** Array of CSS color strings (default: festive colors) */
  colors?: string[];
  /** Particle shapes to use (default: ['circle', 'square']) */
  shapes?: ShapeType[];
  /** Size multiplier (default: 1) */
  scalar?: number;
  /** z-index of the full-screen canvas (default: 100) */
  zIndex?: number;
  /** Disable animation for users who prefer reduced motion (default: true) */
  disableForReducedMotion?: boolean;
}

/**
 * Names of the built-in preset effects
 */
export type PresetName =
  | 'cannon'
  | 'explosion'
  | 'fireworks'
  | 'rain'
  | 'snow'
  | 'sideCannons'
  | 'pride';

/**
 * Options for firing from an element, optionally with a preset
 */
export interface FireFromElementOptions extends KonfettiOptions {
  /** Preset to fire instead of a plain burst */
  preset?: PresetName;
}

/**
 * Options for creating a custom konfetti instance
 */
export interface CreateOptions {
  /** Resize the canvas when the window resizes (default: true) */
  resize?: boolean;
}

/**
 * Internal particle data indices for Float32Array storage
 */
export enum ParticleIndex {
  X = 0,
  Y = 1,
  VelocityX = 2,
  VelocityY = 3,
  Rotation = 4,
  RotationSpeed = 5,
  Tilt = 6,
  TiltSpeed = 7,
  Color = 8,
  Shape = 9,
  Scalar = 10,
  Life = 11,
  MaxLife = 12,
  Drift = 13,
  Gravity = 14,
  Decay = 15,
  SIZE = 16, // Total floats per particle
}

/**
 * Resolved options with all defaults applied
 */
export interface ResolvedOptions {
  particleCount: number;
  angle: number;
  spread: number;
  startVelocity: number;
  decay: number;
  gravity: number;
  drift: number;
  ticks: number;
  origin: Origin;
  colors: string[];
  shapes: ShapeType[];
  scalar: number;
  zIndex: number;
  disableForReducedMotion: boolean;
}
