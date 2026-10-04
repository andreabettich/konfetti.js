import { ParticlePool } from './particle';
import { updateParticles } from './physics';
import { CONTINUOUS_DEFAULTS, isPresetName, PRESETS } from './presets';
import { Renderer } from './renderer';
import type { CreateOptions, KonfettiOptions, PresetName } from './types';
import { clamp, isBrowser, mergeOptions, prefersReducedMotion, resolveOptions } from './utils';

/** Length of one 60 fps frame; physics are tuned in these units */
const FRAME_MS = 1000 / 60;
/** Largest step per frame, so a long stall does not teleport particles */
const MAX_STEP = 4;

/**
 * Manages one canvas: the animation loop, particles, physics and rendering.
 * Safe to construct on the server, where every method does nothing.
 */
export class Konfetti {
  private readonly pool = new ParticlePool();
  private readonly renderer: Renderer | null = null;
  private frameId: number | null = null;
  /** Timestamp of the previous frame, or when the loop was scheduled */
  private lastTime = 0;
  private paused = false;
  private destroyed = false;
  private readonly resizeWithWindow: boolean = false;
  private readonly timeouts = new Set<ReturnType<typeof setTimeout>>();
  private readonly intervals = new Set<ReturnType<typeof setInterval>>();

  constructor(canvas?: HTMLCanvasElement, createOptions: CreateOptions = {}) {
    if (!isBrowser()) {
      this.destroyed = true;
      return;
    }

    this.renderer = new Renderer(canvas);
    this.resizeWithWindow = createOptions.resize !== false;
    if (this.resizeWithWindow) window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Fire one burst. Skipped while the page is hidden, after destroy(), and for
   * visitors who prefer reduced motion (unless disableForReducedMotion is false).
   */
  fire(options?: KonfettiOptions): void {
    if (this.destroyed || !this.renderer || document.hidden) return;

    const resolved = resolveOptions(options);
    if (resolved.disableForReducedMotion && prefersReducedMotion()) return;

    this.renderer.setZIndex(resolved.zIndex);
    const { width, height } = this.renderer.getDimensions();
    this.pool.spawn(resolved, width, height);
    this.scheduleFrame();
  }

  /**
   * Fire a built-in preset; options override the preset's own values
   */
  preset(name: PresetName, options?: KonfettiOptions): void {
    if (!isPresetName(name) || this.destroyed) return;

    for (const burst of PRESETS[name].bursts) {
      const merged = mergeOptions(burst.options, options);
      if (burst.delay) {
        const id = setTimeout(() => {
          this.timeouts.delete(id);
          this.fire(merged);
        }, burst.delay);
        this.timeouts.add(id);
      } else {
        this.fire(merged);
      }
    }
  }

  /**
   * Fire a small burst every `interval` ms until the returned function is
   * called, or until reset() or destroy()
   */
  continuous(options?: KonfettiOptions, interval = 250): () => void {
    if (this.destroyed) return () => {};

    const merged = mergeOptions(CONTINUOUS_DEFAULTS, options);
    const delay = Number.isFinite(interval) && interval >= 16 ? interval : 250;
    const id = setInterval(() => this.fire(merged), delay);
    this.intervals.add(id);

    return () => {
      clearInterval(id);
      this.intervals.delete(id);
    };
  }

  /**
   * Pause the animation; particles stay where they are
   */
  pause(): void {
    this.paused = true;
    this.cancelFrame();
  }

  /**
   * Resume after pause()
   */
  resume(): void {
    this.paused = false;
    this.scheduleFrame();
  }

  /**
   * Clear all particles, cancel scheduled bursts and streams, stop animating and
   * undo pause()
   */
  reset(): void {
    this.paused = false;
    this.cancelFrame();
    for (const id of this.timeouts) clearTimeout(id);
    for (const id of this.intervals) clearInterval(id);
    this.timeouts.clear();
    this.intervals.clear();
    this.pool.reset();
    this.renderer?.clear();
  }

  /**
   * Reset, remove listeners and remove the canvas if this instance created it.
   * The instance ignores every call afterwards.
   */
  destroy(): void {
    if (this.destroyed) return;
    this.reset();
    this.destroyed = true;

    if (this.resizeWithWindow) window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.renderer?.destroy();
  }

  private readonly handleResize = (): void => {
    this.renderer?.resize();
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.cancelFrame();
    } else {
      this.scheduleFrame();
    }
  };

  /**
   * Start the loop if there is something to animate and nothing prevents it
   */
  private scheduleFrame(): void {
    if (
      this.frameId !== null ||
      this.paused ||
      this.destroyed ||
      document.hidden ||
      this.pool.activeCount === 0
    ) {
      return;
    }
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  private cancelFrame(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private readonly tick = (time: number): void => {
    this.frameId = null;
    if (!this.renderer) return;

    const dt = clamp((time - this.lastTime) / FRAME_MS, 0, MAX_STEP);
    this.lastTime = time;

    const hasParticles = updateParticles(this.pool, dt);
    this.renderer.render(this.pool);

    if (hasParticles) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };
}
