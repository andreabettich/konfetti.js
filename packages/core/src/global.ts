import { Konfetti } from './konfetti';
import { isPresetName, PRESETS } from './presets';
import type {
  CreateOptions,
  FireFromElementOptions,
  KonfettiOptions,
  Origin,
  PresetName,
} from './types';
import { isBrowser, mergeOrigin } from './utils';

/**
 * Fire function bound to a canvas, with preset, reset and destroy methods
 */
export interface KonfettiInstance {
  (options?: KonfettiOptions): void;
  /** Fire a built-in preset into this canvas */
  preset: (name: PresetName, options?: KonfettiOptions) => void;
  /** Fire a stream into this canvas; returns a function that stops it */
  continuous: (options?: KonfettiOptions, interval?: number) => () => void;
  /** Clear the canvas and cancel scheduled bursts */
  reset: () => void;
  /** Stop for good and release listeners */
  destroy: () => void;
}

// Global instance for the simple API, created on first use
let globalInstance: Konfetti | null = null;

function getGlobalInstance(): Konfetti | null {
  if (!isBrowser()) return null;
  globalInstance ??= new Konfetti();
  return globalInstance;
}

/**
 * Fire konfetti on the full-screen canvas
 */
export function fire(options?: KonfettiOptions): void {
  getGlobalInstance()?.fire(options);
}

/**
 * Fire a built-in preset on the full-screen canvas
 */
export function firePreset(name: PresetName, options?: KonfettiOptions): void {
  getGlobalInstance()?.preset(name, options);
}

/**
 * The center of an element, as an origin relative to the viewport
 */
export function originFromElement(element: Element): Origin {
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
}

/**
 * Fire from the center of an element, for example the button that was clicked.
 * Single-burst presets (cannon, explosion, pride) start at the element too;
 * screen-wide presets (fireworks, rain, snow, sideCannons) keep their positions.
 * An origin you pass yourself wins, axis by axis.
 */
export function fireFromElement(element: Element, options: FireFromElementOptions = {}): void {
  if (!isBrowser()) return;

  const { preset: name, ...rest } = options;
  // An unknown name (for example a typo in plain JavaScript) fires a plain burst
  const preset = isPresetName(name) ? name : undefined;
  const followsOrigin = preset ? PRESETS[preset].followsOrigin : true;
  const merged = followsOrigin
    ? { ...rest, origin: mergeOrigin(originFromElement(element), rest.origin) }
    : rest;

  if (preset) {
    firePreset(preset, merged);
  } else {
    fire(merged);
  }
}

/**
 * Clear the full-screen canvas and cancel scheduled bursts and streams
 */
export function reset(): void {
  globalInstance?.reset();
}

/**
 * Remove the full-screen canvas and its listeners; the next fire() creates a new one
 */
export function destroy(): void {
  globalInstance?.destroy();
  globalInstance = null;
}

/**
 * Create a konfetti instance that draws into your own canvas
 */
export function create(canvas: HTMLCanvasElement, createOptions?: CreateOptions): KonfettiInstance {
  const instance = new Konfetti(canvas, createOptions);

  const fireFn = ((options?: KonfettiOptions) => instance.fire(options)) as KonfettiInstance;
  fireFn.preset = (name, options) => instance.preset(name, options);
  fireFn.continuous = (options, interval) => instance.continuous(options, interval);
  fireFn.reset = () => instance.reset();
  fireFn.destroy = () => instance.destroy();

  return fireFn;
}

/**
 * Fire a steady stream on the full-screen canvas. Returns a function that stops it.
 */
export function continuous(options?: KonfettiOptions, interval?: number): () => void {
  return getGlobalInstance()?.continuous(options, interval) ?? (() => {});
}

/** Burst of confetti from bottom center shooting up */
export const cannon = (options?: KonfettiOptions): void => firePreset('cannon', options);

/** 360 degree burst from center */
export const explosion = (options?: KonfettiOptions): void => firePreset('explosion', options);

/** Three quick bursts across the top half */
export const fireworks = (options?: KonfettiOptions): void => firePreset('fireworks', options);

/** Particles falling from the top */
export const rain = (options?: KonfettiOptions): void => firePreset('rain', options);

/** Gentle falling white flakes */
export const snow = (options?: KonfettiOptions): void => firePreset('snow', options);

/** Bursts from both sides */
export const sideCannons = (options?: KonfettiOptions): void => firePreset('sideCannons', options);

/** Rainbow colors */
export const pride = (options?: KonfettiOptions): void => firePreset('pride', options);
