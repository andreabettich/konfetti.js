import type { KonfettiOptions, ResolvedOptions, ShapeType } from './types';

/**
 * Default festive colors
 */
export const DEFAULT_COLORS = [
  '#26ccff', // cyan
  '#a25afd', // purple
  '#ff5e7e', // pink
  '#88ff5a', // green
  '#fcff42', // yellow
  '#ffa62d', // orange
  '#ff36ff', // magenta
];

/**
 * Default options
 */
export const DEFAULT_OPTIONS: ResolvedOptions = {
  particleCount: 50,
  angle: 90,
  spread: 45,
  startVelocity: 45,
  decay: 0.9,
  gravity: 1,
  drift: 0,
  ticks: 200,
  origin: { x: 0.5, y: 0.5 },
  colors: DEFAULT_COLORS,
  shapes: ['circle', 'square'] as ShapeType[],
  scalar: 1,
  zIndex: 100,
  disableForReducedMotion: true,
};

/**
 * Merge user options with defaults
 */
export function resolveOptions(options?: KonfettiOptions): ResolvedOptions {
  return {
    particleCount: options?.particleCount ?? DEFAULT_OPTIONS.particleCount,
    angle: options?.angle ?? DEFAULT_OPTIONS.angle,
    spread: options?.spread ?? DEFAULT_OPTIONS.spread,
    startVelocity: options?.startVelocity ?? DEFAULT_OPTIONS.startVelocity,
    decay: options?.decay ?? DEFAULT_OPTIONS.decay,
    gravity: options?.gravity ?? DEFAULT_OPTIONS.gravity,
    drift: options?.drift ?? DEFAULT_OPTIONS.drift,
    ticks: options?.ticks ?? DEFAULT_OPTIONS.ticks,
    origin: options?.origin ?? { ...DEFAULT_OPTIONS.origin },
    colors: options?.colors ?? [...DEFAULT_OPTIONS.colors],
    shapes: options?.shapes ?? [...DEFAULT_OPTIONS.shapes],
    scalar: options?.scalar ?? DEFAULT_OPTIONS.scalar,
    zIndex: options?.zIndex ?? DEFAULT_OPTIONS.zIndex,
    disableForReducedMotion:
      options?.disableForReducedMotion ?? DEFAULT_OPTIONS.disableForReducedMotion,
  };
}

/**
 * Convert degrees to radians
 */
export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get random number between min and max
 */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Get random item from array
 */
export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Convert hex color to RGB values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Pack RGB into a single float for storage
 */
export function packColor(r: number, g: number, b: number): number {
  return r * 65536 + g * 256 + b;
}

/**
 * Unpack color from single float
 */
export function unpackColor(packed: number): { r: number; g: number; b: number } {
  return {
    r: Math.floor(packed / 65536) % 256,
    g: Math.floor(packed / 256) % 256,
    b: packed % 256,
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  return mediaQuery?.matches ?? false;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
