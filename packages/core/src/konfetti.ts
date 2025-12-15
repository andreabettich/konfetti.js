import type { CreateOptions, KonfettiOptions } from './types';

/**
 * Fire function with attached reset and destroy methods
 */
export interface KonfettiInstance {
  (options?: KonfettiOptions): void;
  reset: () => void;
  destroy: () => void;
}

import { ParticlePool } from './particle';
import { PhysicsEngine } from './physics';
import { Renderer } from './renderer';
import { prefersReducedMotion, resolveOptions } from './utils';

/**
 * Main Konfetti class
 * Manages the animation loop and coordinates particles, physics, and rendering
 */
export class Konfetti {
  private pool: ParticlePool;
  private physics: PhysicsEngine;
  private renderer: Renderer;
  private animationId: number | null = null;
  private isRunning: boolean = false;
  private resizeHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;
  private isPaused: boolean = false;

  constructor(canvas?: HTMLCanvasElement, createOptions?: CreateOptions) {
    this.pool = new ParticlePool(1000);
    this.physics = new PhysicsEngine();
    this.renderer = new Renderer();

    // Initialize renderer
    this.renderer.init(canvas, 100);

    // Set up resize handler if requested
    if (createOptions?.resize !== false) {
      this.resizeHandler = () => this.renderer.resize();
      window.addEventListener('resize', this.resizeHandler);
    }

    // Set up visibility handler for pause/resume
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /**
   * Fire confetti with the given options
   */
  fire(options?: KonfettiOptions): void {
    const resolved = resolveOptions(options);

    // Check for reduced motion preference
    if (resolved.disableForReducedMotion && prefersReducedMotion()) {
      return;
    }

    // Configure physics with these options
    this.physics.configure(resolved);

    // Get canvas dimensions
    const { width, height } = this.renderer.getDimensions();

    // Spawn new particles
    this.pool.spawn(resolved, width, height);

    // Start animation if not running
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Start the animation loop
   */
  private start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  /**
   * Animation loop
   */
  private loop = (): void => {
    if (!this.isRunning || this.isPaused) {
      this.animationId = null;
      return;
    }

    // Clear canvas
    this.renderer.clear();

    // Update physics
    const hasActiveParticles = this.physics.update(this.pool);

    // Render particles
    this.renderer.render(this.pool);

    // Continue loop if there are active particles
    if (hasActiveParticles) {
      this.animationId = requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
      this.animationId = null;
    }
  };

  /**
   * Pause animation
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume animation
   */
  resume(): void {
    if (this.isPaused && this.isRunning) {
      this.isPaused = false;
      this.loop();
    }
  }

  /**
   * Reset - clear all particles and stop animation
   */
  reset(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
    this.isPaused = false;
    this.pool.reset();
    this.renderer.clear();
  }

  /**
   * Destroy instance and clean up resources
   */
  destroy(): void {
    this.reset();

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    this.renderer.destroy();
  }
}

// Global instance for simple API
let globalInstance: Konfetti | null = null;

/**
 * Get or create global instance
 */
function getGlobalInstance(): Konfetti {
  if (!globalInstance) {
    globalInstance = new Konfetti();
  }
  return globalInstance;
}

/**
 * Fire konfetti with global instance
 */
export function fire(options?: KonfettiOptions): void {
  getGlobalInstance().fire(options);
}

/**
 * Reset global instance
 */
export function reset(): void {
  if (globalInstance) {
    globalInstance.reset();
  }
}

/**
 * Create a new Konfetti instance for a specific canvas
 */
export function create(canvas: HTMLCanvasElement, createOptions?: CreateOptions): KonfettiInstance {
  const instance = new Konfetti(canvas, createOptions);

  // Return fire function bound to this instance
  const fireFn = ((options?: KonfettiOptions) => instance.fire(options)) as KonfettiInstance;

  // Attach reset and destroy methods
  fireFn.reset = () => instance.reset();
  fireFn.destroy = () => instance.destroy();

  return fireFn;
}
