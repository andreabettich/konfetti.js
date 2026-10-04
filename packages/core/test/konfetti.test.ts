import { describe, expect, it, vi } from 'vitest';
import { makeCanvas, useFakeBrowser } from './helpers';

const env = useFakeBrowser();

/** Fresh module state, so the global instance from one test never leaks into the next */
async function loadCore() {
  vi.resetModules();
  return import('../src/index');
}

const isRed = (color: string) => ['#f00', '#ff0000', 'red', 'rgb(255, 0, 0)'].includes(color);

describe('animation lifecycle', () => {
  it('keeps animating after the page was hidden and shown while idle', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    env.setHidden(true);
    env.setHidden(false);
    k.fire({ particleCount: 10 });
    env.clock.step();

    expect(env.ctx.draws).toHaveLength(10);
    k.destroy();
  });

  it('never runs two animation loops after pause() and resume()', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 5 });
    k.pause();
    k.resume();

    expect(env.clock.pending).toBe(1);
    k.destroy();
  });

  it('stops drawing while paused and continues after resume()', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 5 });
    k.pause();
    env.clock.step();
    expect(env.clock.pending).toBe(0);

    k.resume();
    env.clock.step();
    expect(env.ctx.draws).toHaveLength(5);
    k.destroy();
  });

  it('stops scheduling frames while the page is hidden and resumes when shown', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 5 });
    env.setHidden(true);
    env.clock.step();
    expect(env.clock.pending).toBe(0);

    env.setHidden(false);
    env.clock.step();
    expect(env.ctx.draws).toHaveLength(5);
    k.destroy();
  });

  it('skips bursts fired while the page is hidden', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    env.setHidden(true);
    k.fire({ particleCount: 5 });
    env.setHidden(false);

    expect(env.clock.pending).toBe(0);
    k.destroy();
  });

  it('stops once every particle has died', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 5, ticks: 30 });
    const frames = env.clock.runToEnd();

    expect(frames).toBeGreaterThan(0);
    expect(frames).toBeLessThanOrEqual(31);
    expect(env.clock.pending).toBe(0);
    k.destroy();
  });

  it('ignores fire() after destroy()', async () => {
    const { create } = await loadCore();
    const burst = create(makeCanvas());

    burst.destroy();
    burst({ particleCount: 10 });

    expect(env.clock.pending).toBe(0);
  });

  it('respects prefers-reduced-motion unless told otherwise', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();
    env.setReducedMotion(true);

    k.fire();
    expect(env.clock.pending).toBe(0);

    k.fire({ disableForReducedMotion: false, particleCount: 3 });
    env.clock.step();
    expect(env.ctx.draws).toHaveLength(3);
    k.destroy();
  });
});

describe('options', () => {
  it('lets presets keep their own values when options are undefined', async () => {
    const { cannon } = await loadCore();

    cannon({ particleCount: undefined, origin: undefined, colors: undefined });
    env.clock.step();

    // cannon fires 100 pieces from the bottom edge (y = 600)
    expect(env.ctx.draws).toHaveLength(100);
    expect(Math.min(...env.ctx.draws.map((d) => d.y))).toBeGreaterThan(450);
  });

  it('applies zIndex to the full-screen canvas', async () => {
    const { fire } = await loadCore();

    fire({ zIndex: 9999 });

    expect(document.querySelector('canvas')?.style.zIndex).toBe('9999');
  });

  it('falls back to defaults for invalid numbers instead of breaking live particles', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 10 });
    k.fire({ particleCount: Number.NaN, spread: Number.NaN, startVelocity: Infinity });
    env.clock.step();

    expect(env.ctx.draws).toHaveLength(60);
    expect(env.ctx.draws.every((d) => Number.isFinite(d.x) && Number.isFinite(d.y))).toBe(true);
    k.destroy();
  });

  it('accepts short hex and named colors', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 4, colors: ['#f00'] });
    k.fire({ particleCount: 4, colors: ['red'] });
    env.clock.step();

    expect(env.ctx.draws).toHaveLength(8);
    expect(env.ctx.draws.every((d) => isRed(d.fillStyle))).toBe(true);
    k.destroy();
  });

  it('keeps gravity per burst, so a later burst does not change earlier particles', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    // A piece that should hover in place: no speed, no gravity, no drift
    k.fire({ particleCount: 1, startVelocity: 0, gravity: 0, origin: { x: 0.5, y: 0.5 } });
    k.fire({ particleCount: 1, gravity: 3, origin: { x: 0.1, y: 0.1 } });
    for (let i = 0; i < 10; i++) env.clock.step();

    const hovering = env.ctx.draws.find((d) => Math.abs(d.x - 400) < 1);
    expect(hovering?.y).toBeCloseTo(300, 0);
    k.destroy();
  });
});

describe('timing and rendering', () => {
  it('lasts the same time on 60 Hz and 120 Hz displays', async () => {
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 5, ticks: 60 });
    const frames60 = env.clock.runToEnd(1000 / 60);
    k.fire({ particleCount: 5, ticks: 60 });
    const frames120 = env.clock.runToEnd(1000 / 120);

    expect(Math.abs(frames120 / 2 - frames60)).toBeLessThanOrEqual(2);
    k.destroy();
  });

  it('moves pieces at the same speed on 60 Hz and 120 Hz displays', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { Konfetti } = await loadCore();

    const fall = (interval: number, frames: number) => {
      const k = new Konfetti();
      k.fire({ particleCount: 1, origin: { x: 0.5, y: 0.5 } });
      for (let i = 0; i < frames; i++) env.clock.step(interval);
      const y = env.ctx.draws[0].y;
      k.destroy();
      return y;
    };

    const y60 = fall(1000 / 60, 12);
    const y120 = fall(1000 / 120, 24);

    expect(Math.abs(y120 - y60)).toBeLessThan(Math.abs(y60 - 300) * 0.15);
  });

  it('renders sharply on high-density screens', async () => {
    env.setDevicePixelRatio(2);
    const { Konfetti } = await loadCore();
    const k = new Konfetti();

    k.fire({ particleCount: 1, startVelocity: 0, gravity: 0, origin: { x: 0.5, y: 0.5 } });
    env.clock.step();

    const canvas = document.querySelector('canvas')!;
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(1200);
    expect(env.ctx.draws[0].x).toBeCloseTo(400, 0);
    k.destroy();
  });

  it('gives each instance its own canvas', async () => {
    const { Konfetti } = await loadCore();
    const a = new Konfetti();
    const b = new Konfetti();

    expect(document.querySelectorAll('canvas')).toHaveLength(2);
    a.destroy();
    expect(document.querySelectorAll('canvas')).toHaveLength(1);
    b.destroy();
  });
});

describe('scheduled effects', () => {
  it('reset() cancels fireworks bursts that have not fired yet', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { fireworks, reset } = await loadCore();

    fireworks();
    reset();
    vi.advanceTimersByTime(1000);

    expect(env.clock.pending).toBe(0);
  });

  it('reset() stops a continuous stream', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { continuous, reset } = await loadCore();

    continuous();
    vi.advanceTimersByTime(300);
    reset();
    vi.advanceTimersByTime(1000);

    expect(env.clock.pending).toBe(0);
  });

  it('the function returned by continuous() stops the stream', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { continuous, reset } = await loadCore();

    const stop = continuous({ particleCount: 2 }, 100);
    vi.advanceTimersByTime(350);
    stop();
    env.clock.runToEnd();
    vi.advanceTimersByTime(1000);

    expect(env.clock.pending).toBe(0);
    reset();
  });
});
