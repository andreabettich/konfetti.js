import type { ParticlePool } from './particle';
import { getShapeRenderer } from './shapes';
import { ParticleIndex } from './types';

/** Base particle size in CSS pixels */
const BASE_SIZE = 10;

/** Number of precomputed brightness steps per color */
const SHADE_STEPS = 16;
/** Brightness of a piece facing away from the light, and of one facing it */
const MIN_BRIGHTNESS = 0.55;
const MAX_BRIGHTNESS = 1.2;
/** Share of the lifetime at its end during which a piece still on screen fades out */
const LIFETIME_FADE = 0.1;
/** Cap on cached colors; well above the palette size, so live colors never thrash */
const MAX_SHADE_CACHE = 4096;

type Rgba = [number, number, number, number];

/** What an unset canvas fill draws, used for colors the canvas rejects */
const BLACK: Rgba = [0, 0, 0, 1];

/**
 * Read any CSS color as RGBA by letting the canvas normalize it. A canvas
 * ignores invalid colors, so the color is applied over two different sentinels:
 * if the results differ, the canvas rejected it.
 */
function parseColor(ctx: CanvasRenderingContext2D, color: string): Rgba | null {
  ctx.fillStyle = '#000000';
  ctx.fillStyle = color;
  const overBlack = String(ctx.fillStyle);
  ctx.fillStyle = '#ffffff';
  ctx.fillStyle = color;
  if (String(ctx.fillStyle) !== overBlack) return null;

  const hex = /^#([0-9a-f]{6})$/i.exec(overBlack);
  if (hex) {
    const value = Number.parseInt(hex[1], 16);
    return [value >> 16, (value >> 8) & 255, value & 255, 1];
  }
  const rgba = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(overBlack);
  if (!rgba) return null;
  const alpha = rgba[4] === undefined ? 1 : Number(rgba[4]);
  return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), alpha];
}

/**
 * Brightness steps for one color: darker below 1, toward white above 1.
 * Transparency is kept.
 */
function buildShades([r, g, b, alpha]: Rgba): string[] {
  const shades: string[] = [];
  for (let step = 0; step < SHADE_STEPS; step++) {
    const brightness =
      MIN_BRIGHTNESS + ((MAX_BRIGHTNESS - MIN_BRIGHTNESS) * step) / (SHADE_STEPS - 1);
    const [sr, sg, sb] = [r, g, b].map((c) =>
      Math.round(brightness <= 1 ? c * brightness : c + (255 - c) * (brightness - 1))
    );
    shades.push(alpha < 1 ? `rgba(${sr}, ${sg}, ${sb}, ${alpha})` : `rgb(${sr}, ${sg}, ${sb})`);
  }
  return shades;
}

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
  /** Brightness steps per color */
  private readonly shadeCache = new Map<string, string[]>();
  /** Particle indices grouped by color and shade step, reused between frames */
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
   * Draw every piece as flat paper turned in 3D: the transform is the piece's
   * rotation projected onto the screen (computed by physics), and its color is
   * shaded by how much its visible side faces the light. Pieces are drawn
   * grouped by color and shade, so the fill changes once per group.
   */
  render(pool: ParticlePool): void {
    this.clear();
    const ctx = this.ctx;
    if (!ctx) return;

    const data = pool.data;
    const ratio = this.pixelRatio;
    const buckets = this.buckets;

    // Keys are color × shade, so the array has holes
    for (const bucket of buckets) if (bucket) bucket.length = 0;
    for (let i = 0; i < pool.activeCount; i++) {
      const idx = i * ParticleIndex.SIZE;
      const step = Math.round(data[idx + ParticleIndex.Light] * (SHADE_STEPS - 1));
      const key = data[idx + ParticleIndex.Color] * SHADE_STEPS + step;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(idx);
    }

    for (let key = 0; key < buckets.length; key++) {
      const bucket = buckets[key];
      if (!bucket || bucket.length === 0) continue;
      const color = pool.palette[Math.floor(key / SHADE_STEPS)];
      ctx.fillStyle = this.shadesFor(ctx, color)[key % SHADE_STEPS];

      for (const idx of bucket) {
        // Pieces normally fall out of view; fade only if the lifetime runs out first
        const opacity = Math.min(
          1,
          data[idx + ParticleIndex.Life] / (data[idx + ParticleIndex.MaxLife] * LIFETIME_FADE)
        );
        const size = BASE_SIZE * data[idx + ParticleIndex.Scalar];
        if (size < 0.5 || opacity < 0.01) continue;

        ctx.globalAlpha = opacity;
        ctx.setTransform(
          ratio * data[idx + ParticleIndex.AxisXX],
          ratio * data[idx + ParticleIndex.AxisXY],
          ratio * data[idx + ParticleIndex.AxisYX],
          ratio * data[idx + ParticleIndex.AxisYY],
          ratio * data[idx + ParticleIndex.X],
          ratio * data[idx + ParticleIndex.Y]
        );
        getShapeRenderer(data[idx + ParticleIndex.Shape])(ctx, size);
      }
    }

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private shadesFor(ctx: CanvasRenderingContext2D, color: string): string[] {
    let shades = this.shadeCache.get(color);
    if (!shades) {
      if (this.shadeCache.size >= MAX_SHADE_CACHE) this.shadeCache.clear();
      shades = buildShades(parseColor(ctx, color) ?? BLACK);
      this.shadeCache.set(color, shades);
    }
    return shades;
  }

  /**
   * Destroy renderer and remove the canvas if we created it
   */
  destroy(): void {
    this.clear();
    if (this.ownsCanvas) this.canvas.remove();
  }
}
