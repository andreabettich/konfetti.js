import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@konfetti-js/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@konfetti-js/core')>();
  return {
    ...actual,
    fire: vi.fn(),
    firePreset: vi.fn(),
    fireFromElement: vi.fn(),
    reset: vi.fn(),
  };
});

import { fire, fireFromElement, firePreset } from '@konfetti-js/core';
import { defineAllElements, type KonfettiElement } from '../src';

defineAllElements();

function render(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
}

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('<konfetti-trigger>', () => {
  it('fires once per click when the trigger attribute is in the HTML', () => {
    const el = render('<konfetti-trigger trigger="click"><button>Go</button></konfetti-trigger>');

    el.querySelector('button')?.click();

    expect(fireFromElement).toHaveBeenCalledTimes(1);
    expect(fireFromElement).toHaveBeenCalledWith(el, { preset: undefined });
  });

  it('moves the listener when the trigger attribute changes', () => {
    const el = render('<konfetti-trigger><button>Go</button></konfetti-trigger>');

    el.setAttribute('trigger', 'dblclick');
    el.querySelector('button')?.click();
    expect(fireFromElement).not.toHaveBeenCalled();

    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(fireFromElement).toHaveBeenCalledTimes(1);
  });

  it('stops listening when removed from the page', () => {
    const el = render('<konfetti-trigger></konfetti-trigger>');

    el.remove();
    el.click();

    expect(fireFromElement).not.toHaveBeenCalled();
  });

  it('skips invalid numbers and unknown presets', () => {
    const el = render(
      '<konfetti-trigger particle-count="lots" spread="70" preset="nope"></konfetti-trigger>'
    );

    el.click();

    expect(fireFromElement).toHaveBeenCalledWith(el, { spread: 70, preset: undefined });
  });

  it('passes a valid preset, colors and origin', () => {
    const el = render(
      '<konfetti-trigger preset="pride" colors="#f00, #0f0" origin-x="0.2"></konfetti-trigger>'
    );

    el.click();

    expect(fireFromElement).toHaveBeenCalledWith(el, {
      preset: 'pride',
      colors: ['#f00', '#0f0'],
      origin: { x: 0.2 },
    });
  });

  it('announces each burst with a konfetti-fired event', () => {
    const el = render('<konfetti-trigger particle-count="20"></konfetti-trigger>');
    const listener = vi.fn();
    el.addEventListener('konfetti-fired', listener);

    el.click();

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ particleCount: 20 });
  });
});

describe('<konfetti-burst>', () => {
  it('fires its preset with attributes and overrides', () => {
    const el = render(
      '<konfetti-burst preset="snow" particle-count="12"></konfetti-burst>'
    ) as KonfettiElement;

    el.fire({ drift: 2 });

    expect(firePreset).toHaveBeenCalledWith('snow', { particleCount: 12, drift: 2 });
  });

  it('keeps attribute values when an override is undefined', () => {
    const el = render('<konfetti-burst colors="red,blue"></konfetti-burst>') as KonfettiElement;

    el.fire({ colors: undefined, particleCount: 20 });

    expect(fire).toHaveBeenCalledWith({ colors: ['red', 'blue'], particleCount: 20 });
  });

  it('sends only the origin axis that is set, so presets keep the other', () => {
    const el = render(
      '<konfetti-burst preset="cannon" origin-x="0.2"></konfetti-burst>'
    ) as KonfettiElement;

    el.fire();

    expect(firePreset).toHaveBeenCalledWith('cannon', { origin: { x: 0.2 } });
  });

  it('fires a plain burst without a preset', () => {
    const el = render('<konfetti-burst angle="60"></konfetti-burst>') as KonfettiElement;

    el.fire();

    expect(fire).toHaveBeenCalledWith({ angle: 60 });
  });
});
