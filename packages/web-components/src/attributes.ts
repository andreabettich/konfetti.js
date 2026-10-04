import { isPresetName, type KonfettiOptions, type PresetName } from '@konfetti-js/core';

/**
 * Base class that does not touch HTMLElement on the server, so importing this
 * package during server rendering does not throw
 */
export const BaseElement = (
  typeof HTMLElement === 'undefined' ? class {} : HTMLElement
) as typeof HTMLElement;

const NUMBER_ATTRIBUTES = {
  'particle-count': 'particleCount',
  angle: 'angle',
  spread: 'spread',
  'start-velocity': 'startVelocity',
  decay: 'decay',
  gravity: 'gravity',
  drift: 'drift',
  ticks: 'ticks',
  scalar: 'scalar',
  'z-index': 'zIndex',
} as const satisfies Record<string, keyof KonfettiOptions>;

function readNumber(el: Element, name: string): number | undefined {
  const raw = el.getAttribute(name);
  if (raw === null || raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function readList(el: Element, name: string): string[] | undefined {
  const raw = el.getAttribute(name);
  if (!raw) return undefined;
  const items = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

/**
 * Read konfetti options from an element's attributes. Missing or invalid
 * values are left out, so the library defaults (or preset values) apply.
 */
export function readOptions(el: Element): KonfettiOptions {
  const options: Record<string, unknown> = {};

  for (const [attribute, option] of Object.entries(NUMBER_ATTRIBUTES)) {
    const value = readNumber(el, attribute);
    if (value !== undefined) options[option] = value;
  }

  const originX = readNumber(el, 'origin-x');
  const originY = readNumber(el, 'origin-y');
  if (originX !== undefined || originY !== undefined) {
    options.origin = { x: originX ?? 0.5, y: originY ?? 0.5 };
  }

  const colors = readList(el, 'colors');
  if (colors) options.colors = colors;

  const shapes = readList(el, 'shapes');
  if (shapes) options.shapes = shapes;

  return options as KonfettiOptions;
}

/**
 * The element's `preset` attribute, if it names a built-in preset
 */
export function readPreset(el: Element): PresetName | undefined {
  const preset = el.getAttribute('preset');
  return isPresetName(preset) ? preset : undefined;
}
