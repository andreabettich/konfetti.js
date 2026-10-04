import { isShape } from './shapes';
import type { KonfettiOptions, Origin, ResolvedOptions, ShapeType } from './types';

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
 * Use `value` when it is a finite number, otherwise `fallback`
 */
function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Merge user options with defaults, replacing missing or invalid values
 */
export function resolveOptions(options: KonfettiOptions = {}): ResolvedOptions {
  const d = DEFAULT_OPTIONS;
  const colors = Array.isArray(options.colors)
    ? options.colors.filter((c) => typeof c === 'string' && c.length > 0)
    : [];
  const shapes = Array.isArray(options.shapes) ? options.shapes.filter(isShape) : [];

  return {
    particleCount: Math.max(0, Math.round(finite(options.particleCount, d.particleCount))),
    angle: finite(options.angle, d.angle),
    spread: finite(options.spread, d.spread),
    startVelocity: finite(options.startVelocity, d.startVelocity),
    decay: clamp(finite(options.decay, d.decay), 0, 1),
    gravity: finite(options.gravity, d.gravity),
    drift: finite(options.drift, d.drift),
    ticks: Math.max(1, finite(options.ticks, d.ticks)),
    origin: {
      x: finite(options.origin?.x, d.origin.x),
      y: finite(options.origin?.y, d.origin.y),
    },
    colors: colors.length > 0 ? colors : [...d.colors],
    shapes: shapes.length > 0 ? shapes : [...d.shapes],
    scalar: Math.max(0, finite(options.scalar, d.scalar)),
    zIndex: finite(options.zIndex, d.zIndex),
    disableForReducedMotion: options.disableForReducedMotion ?? d.disableForReducedMotion,
  };
}

/**
 * Layer `override` on top of `base`, skipping keys that are explicitly undefined
 * so a wrapper passing `{ colors: undefined }` keeps the preset's colors
 */
export function mergeOptions(base: KonfettiOptions, override?: KonfettiOptions): KonfettiOptions {
  const merged: Record<string, unknown> = { ...base };
  if (override) {
    for (const [key, value] of Object.entries(override)) {
      if (value !== undefined) merged[key] = value;
    }
    // Origins merge per axis, so { x: 0.2 } keeps the base's y
    if (override.origin) merged.origin = mergeOrigin(base.origin, override.origin);
  }
  return merged as KonfettiOptions;
}

/**
 * Layer the defined axes of `override` on top of `base`
 */
export function mergeOrigin(
  base: Partial<Origin> | undefined,
  override: Partial<Origin> | undefined
): Partial<Origin> {
  return {
    ...base,
    ...(override?.x !== undefined && { x: override.x }),
    ...(override?.y !== undefined && { y: override.y }),
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
export function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Whether we are running in a browser with a DOM
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
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
