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
    for (const shade of shades) expect(shade).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    k.destroy();
  });

  it('still draws colors it cannot parse, unshaded', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 3, colors: ['not-a-color'] });
    env.clock.step();

    expect(env.ctx.draws.map((d) => d.fillStyle)).toEqual(Array(3).fill('not-a-color'));
    k.destroy();
  });
});
