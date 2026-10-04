import type { ParticlePool } from './particle';
import { getShapeRenderer } from './shapes';
import { ParticleIndex } from './types';

/** Base particle size in CSS pixels */
const BASE_SIZE = 10;

/**
 * Create a full-screen overlay canvas that never blocks the page
 */
function createOverlayCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = 'konfetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '100',
  });
  document.body.appendChild(canvas);
  return canvas;
}

/**
 * Canvas renderer for particles
 */
export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  /** True when we created the canvas, so we may style and remove it */
  private readonly ownsCanvas: boolean;
  /** Size in CSS pixels; the backing store is this times the pixel ratio */
  private width = 0;
  private height = 0;
  private pixelRatio = 1;
  /** Particle indices grouped by palette color, reused between frames */
  private readonly buckets: number[][] = [];

  constructor(canvas?: HTMLCanvasElement) {
    this.ownsCanvas = !canvas;
    this.canvas = canvas ?? createOverlayCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  /**
   * Match the canvas to its display size. The full-screen canvas also renders at
   * the screen's pixel density; a canvas you pass in keeps one pixel per CSS
   * pixel, because without a CSS size its display size follows its pixel size
   * and would grow on every resize.
   */
  resize(): void {
    if (this.ownsCanvas) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = window.devicePixelRatio || 1;
    } else {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.pixelRatio = 1;
    }
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);
  }

  /**
   * Canvas size in CSS pixels
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Set the stacking order; only applies to the full-screen canvas we own
   */
  setZIndex(zIndex: number): void {
    if (this.ownsCanvas) this.canvas.style.zIndex = String(zIndex);
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    if (!this.ctx) return;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw all particles, batched by color to limit fillStyle changes
   */
  render(pool: ParticlePool): void {
    this.clear();
    const ctx = this.ctx;
    if (!ctx) return;

    const data = pool.data;
    const ratio = this.pixelRatio;
    const buckets = this.buckets;

    for (const bucket of buckets) bucket.length = 0;
    for (let i = 0; i < pool.activeCount; i++) {
      const colorId = data[i * ParticleIndex.SIZE + ParticleIndex.Color];
      if (!buckets[colorId]) buckets[colorId] = [];
      buckets[colorId].push(i);
    }

    for (let colorId = 0; colorId < buckets.length; colorId++) {
      const bucket = buckets[colorId];
      if (!bucket || bucket.length === 0) continue;
      ctx.fillStyle = pool.palette[colorId];

      for (const particle of bucket) {
        const idx = particle * ParticleIndex.SIZE;
        const tilt = data[idx + ParticleIndex.Tilt];
        const rotation = data[idx + ParticleIndex.Rotation];

        // Fade out over the last half of the particle's life
        const opacity = Math.min(
          1,
          (data[idx + ParticleIndex.Life] / data[idx + ParticleIndex.MaxLife]) * 2
        );
        const size = BASE_SIZE * data[idx + ParticleIndex.Scalar] * (0.8 + 0.2 * Math.cos(tilt));
        if (size < 0.5 || opacity < 0.01) continue;

        // translate(x, y) · rotate(rotation) · scale(1, squash), scaled to device pixels.
        // Setting the matrix directly avoids a save()/restore() per particle.
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const squash = 0.6 + 0.4 * Math.abs(Math.cos(tilt));
        ctx.globalAlpha = opacity;
        ctx.setTransform(
          ratio * cos,
          ratio * sin,
          -ratio * sin * squash,
          ratio * cos * squash,
          ratio * data[idx + ParticleIndex.X],
          ratio * data[idx + ParticleIndex.Y]
        );
        getShapeRenderer(data[idx + ParticleIndex.Shape])(ctx, size);
      }
    }

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Destroy renderer and remove the canvas if we created it
   */
  destroy(): void {
    this.clear();
    if (this.ownsCanvas) this.canvas.remove();
  }
}
