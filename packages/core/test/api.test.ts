import { describe, expect, it, vi } from 'vitest';
import { makeCanvas, useFakeBrowser } from './helpers';

const env = useFakeBrowser();

async function loadCore() {
  vi.resetModules();
  return import('../src/index');
}

/** An element whose center sits at (200, 150) in an 800×600 viewport */
function makeButton(): HTMLElement {
  const button = document.createElement('button');
  button.getBoundingClientRect = () =>
    ({ left: 150, top: 130, width: 100, height: 40, right: 250, bottom: 170 }) as DOMRect;
  document.body.appendChild(button);
  return button;
}

describe('presets', () => {
  it('lists every preset name', async () => {
    const { PRESET_NAMES, isPresetName } = await loadCore();

    expect(PRESET_NAMES).toEqual([
      'cannon',
      'explosion',
      'fireworks',
      'rain',
      'snow',
      'sideCannons',
      'pride',
    ]);
    expect(isPresetName('snow')).toBe(true);
    expect(isPresetName('confetti')).toBe(false);
    expect(isPresetName(undefined)).toBe(false);
  });

  it('firePreset() fires the named preset', async () => {
    const { firePreset } = await loadCore();

    firePreset('cannon');
    env.clock.step();

    expect(env.ctx.draws).toHaveLength(100);
  });

  it('firePreset() lets options override the preset', async () => {
    const { firePreset } = await loadCore();

    firePreset('snow', { particleCount: 7 });
    env.clock.step();

    expect(env.ctx.draws).toHaveLength(7);
  });

  it('instances from create() can fire presets into their own canvas', async () => {
    const { create } = await loadCore();
    const burst = create(makeCanvas());

    burst.preset('explosion', { particleCount: 12 });
    env.clock.step();

    expect(env.ctx.draws).toHaveLength(12);
    burst.destroy();
  });
});

describe('fireFromElement()', () => {
  it('fires from the center of the element', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { fireFromElement } = await loadCore();

    fireFromElement(makeButton(), { particleCount: 1, startVelocity: 0, gravity: 0 });
    env.clock.step();

    expect(env.ctx.draws[0].x).toBeCloseTo(200, 0);
    expect(env.ctx.draws[0].y).toBeCloseTo(150, 0);
  });

  it('anchors burst presets to the element', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { fireFromElement } = await loadCore();

    fireFromElement(makeButton(), { preset: 'explosion', startVelocity: 0, gravity: 0 });
    env.clock.step();

    expect(env.ctx.draws.every((d) => Math.abs(d.x - 200) < 1)).toBe(true);
  });

  it('leaves screen-wide presets where they are', async () => {
    const { fireFromElement } = await loadCore();

    fireFromElement(makeButton(), { preset: 'sideCannons' });
    env.clock.step();

    const xs = env.ctx.draws.map((d) => d.x);
    expect(Math.min(...xs)).toBeLessThan(100);
    expect(Math.max(...xs)).toBeGreaterThan(700);
  });

  it('keeps an origin you pass yourself', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { fireFromElement } = await loadCore();

    fireFromElement(makeButton(), {
      particleCount: 1,
      startVelocity: 0,
      gravity: 0,
      origin: { x: 0.25, y: 0.75 },
    });
    env.clock.step();

    expect(env.ctx.draws[0].x).toBeCloseTo(200, 0);
    expect(env.ctx.draws[0].y).toBeCloseTo(450, 0);
  });
});

describe('global instance', () => {
  it('destroy() removes the canvas, and the next fire() starts fresh', async () => {
    const { destroy, fire } = await loadCore();

    fire();
    expect(document.querySelectorAll('canvas')).toHaveLength(1);

    destroy();
    expect(document.querySelectorAll('canvas')).toHaveLength(0);

    fire({ particleCount: 3 });
    env.clock.step();
    expect(document.querySelectorAll('canvas')).toHaveLength(1);
    expect(env.ctx.draws).toHaveLength(3);
  });

  it('marks the canvas as decorative', async () => {
    const { fire } = await loadCore();

    fire();

    const canvas = document.querySelector('canvas')!;
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(canvas.style.pointerEvents).toBe('none');
  });
});
