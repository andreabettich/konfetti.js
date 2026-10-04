import { describe, expect, it, vi } from 'vitest';
import { useFakeBrowser } from './helpers';

const env = useFakeBrowser();

async function loadCore() {
  vi.resetModules();
  return import('../src/index');
}

/** y of the first drawn piece after `frames` more frames */
function yAfter(frames: number): number {
  for (let i = 0; i < frames; i++) env.clock.step();
  return env.ctx.draws[0].y;
}

describe('paper look', () => {
  it('keeps pieces fully visible instead of fading them in mid-air', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 20 });
    for (let i = 0; i < 150; i++) env.clock.step();

    expect(env.ctx.draws.length).toBeGreaterThan(0);
    expect(env.ctx.draws.every((d) => d.alpha === 1)).toBe(true);
    k.destroy();
  });

  it('fades a piece that is still on screen when its lifetime runs out', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 1, startVelocity: 0, gravity: 0, ticks: 100 });
    for (let i = 0; i < 95; i++) env.clock.step();

    expect(env.ctx.draws[0].alpha).toBeLessThan(1);
    expect(env.ctx.draws[0].alpha).toBeGreaterThan(0);
    k.destroy();
  });

  it('removes pieces once they fall below the screen', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    // Starts just above the bottom edge with no launch speed
    k.fire({ particleCount: 5, startVelocity: 0, origin: { x: 0.5, y: 0.95 } });
    const frames = env.clock.runToEnd();

    expect(frames).toBeLessThan(200);
    expect(env.clock.pending).toBe(0);
    k.destroy();
  });

  it('falls like paper: slowly, at a steady pace', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 1, startVelocity: 0, origin: { x: 0.5, y: 0.1 } });
    const start = yAfter(60);
    const middle = yAfter(60);
    const end = yAfter(60);
    const first = (middle - start) / 60;
    const second = (end - middle) / 60;

    // About 2 px per frame (120 px/s), nearly constant once settled
    expect(first).toBeGreaterThan(1);
    expect(first).toBeLessThan(3.5);
    expect(Math.abs(second - first)).toBeLessThan(0.5);
    k.destroy();
  });

  it('shades pieces as they turn toward or away from the light', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 40, colors: ['#ff48b0'] });
    const shades = new Set<string>();
    for (let i = 0; i < 30; i++) {
      env.clock.step();
      for (const d of env.ctx.draws) shades.add(d.fillStyle);
    }

    expect(shades.size).toBeGreaterThan(4);
    // The canvas reads opaque colors back as #rrggbb
    for (const shade of shades) expect(shade).toMatch(/^#[0-9a-f]{6}$/);
    k.destroy();
  });

  it('draws colors it cannot parse as shaded black, like an unset canvas fill', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 6, colors: ['not-a-color'] });
    env.clock.step();

    expect(env.ctx.draws).toHaveLength(6);
    // Black, or dark gray where the light catches it
    expect(env.ctx.draws.every((d) => /^#([0-3][0-9a-f])\1\1$/.test(d.fillStyle))).toBe(true);
    k.destroy();
  });

  it('keeps the transparency of rgba colors', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 6, colors: ['rgba(255, 0, 0, 0.5)'] });
    env.clock.step();

    // Shades of red (lit ones lighten toward white), all still half transparent
    for (const d of env.ctx.draws) expect(d.fillStyle).toMatch(/^rgba\(\d+, (\d+), \1, 0\.5\)$/);
    k.destroy();
  });

  it('batches drawing by color and shade instead of switching fill per piece', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 300, colors: ['#ff48b0', '#0078bf'] });
    env.clock.step();
    const before = env.ctx.fillStyleChanges;
    env.clock.step();

    // At most one change per color and shade step, far fewer than 300 pieces
    expect(env.ctx.fillStyleChanges - before).toBeLessThanOrEqual(2 * 16);
    k.destroy();
  });

  it('keeps pieces launched from just below the screen', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    // Below the bottom edge, shooting up
    k.fire({ particleCount: 10, angle: 90, spread: 0, origin: { x: 0.5, y: 1.3 } });
    for (let i = 0; i < 20; i++) env.clock.step();

    expect(env.ctx.draws.length).toBeGreaterThan(0);
    expect(Math.min(...env.ctx.draws.map((d) => d.y))).toBeLessThan(600);
    k.destroy();
  });

  it('removes pieces that float off the top and will not come back', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 5, gravity: 0, angle: 90, spread: 0, origin: { x: 0.5, y: 0.1 } });
    const frames = env.clock.runToEnd();

    expect(frames).toBeLessThan(300);
    k.destroy();
  });

  it('keeps pieces while a custom canvas has no size yet', async () => {
    const { create } = await loadCore();
    const canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = () => ({ width: 0, height: 0, top: 0, left: 0 }) as DOMRect;
    document.body.appendChild(canvas);
    const burst = create(canvas);

    burst({ particleCount: 3, ticks: 120, startVelocity: 0 });
    const frames = env.clock.runToEnd();

    expect(frames).toBeGreaterThanOrEqual(119);
    burst.destroy();
  });
});

describe('custom canvas size', () => {
  it('follows the canvas when its layout size changes', async () => {
    let size = { width: 0, height: 0 };
    const observers: Array<() => void> = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          observers.push(callback);
        }
        observe() {}
        disconnect() {}
      }
    );
    const { create } = await loadCore();
    const canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = () => ({ ...size, top: 0, left: 0 }) as DOMRect;
    document.body.appendChild(canvas);
    const burst = create(canvas);

    // The canvas gets its size later, through layout rather than a window resize
    size = { width: 400, height: 300 };
    for (const notify of observers) notify();

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(300);
    burst.destroy();
  });
});

describe('falling-leaf glide', () => {
  it('slides a tilted falling piece toward its lower edge', async () => {
    vi.resetModules();
    const { ParticlePool } = await import('../src/particle');
    const { updateParticles } = await import('../src/physics');
    const { ParticleIndex } = await import('../src/types');
    const { resolveOptions } = await import('../src/utils');

    const pool = new ParticlePool();
    pool.spawn(resolveOptions({ particleCount: 1, startVelocity: 0, drift: 0 }), 800, 600);
    const at = (field: number) => field;
    const d = pool.data;
    // Surface runs from upper left down to lower right: normal (1, -1)/√2, lower edge on the right
    d[at(ParticleIndex.Tilt)] = Math.PI / 2;
    d[at(ParticleIndex.Rotation)] = Math.PI / 4;
    d[at(ParticleIndex.Wobble)] = 0;
    d[at(ParticleIndex.TiltSpeed)] = 0;
    d[at(ParticleIndex.WobbleSpeed)] = 0;
    d[at(ParticleIndex.RotationSpeed)] = 0;
    d[at(ParticleIndex.Drift)] = 0;
    d[at(ParticleIndex.AirPhase)] = 0;
    d[at(ParticleIndex.AirPhaseSpeed)] = 0;
    d[at(ParticleIndex.VelocityX)] = 0;
    d[at(ParticleIndex.VelocityY)] = 2;

    updateParticles(pool, 1, 800, 600);

    expect(d[ParticleIndex.VelocityX]).toBeGreaterThan(0);
  });
});
