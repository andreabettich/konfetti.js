import { createOrientation, orient } from './orientation';
import type { ParticlePool } from './particle';
import { getShapeRenderer } from './shapes';
import { ParticleIndex } from './types';

/** Base particle size in CSS pixels */
const BASE_SIZE = 10;

/** Light from the upper left, slightly in front (unit vector) */
const LIGHT_X = -0.3;
const LIGHT_Y = -0.6;
const LIGHT_Z = 0.742;
/** Number of precomputed brightness steps per color */
const SHADE_STEPS = 16;
/** Brightness of a piece facing away from the light, and of one facing it */
const MIN_BRIGHTNESS = 0.55;
const MAX_BRIGHTNESS = 1.2;
/** Share of the lifetime at its end during which a piece still on screen fades out */
const LIFETIME_FADE = 0.1;
/** Cap on cached colors, so streams with random colors don't grow it forever */
const MAX_SHADE_CACHE = 512;

/**
 * Read any CSS color as RGB by letting the canvas normalize it.
 * Returns null for values the canvas does not understand.
 */
function parseColor(ctx: CanvasRenderingContext2D, color: string): [number, number, number] | null {
  ctx.fillStyle = '#000000';
  ctx.fillStyle = color;
  const normalized = String(ctx.fillStyle);

  const hex = /^#([0-9a-f]{6})$/i.exec(normalized);
  if (hex) {
    const value = Number.parseInt(hex[1], 16);
    return [value >> 16, (value >> 8) & 255, value & 255];
  }
  const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(normalized);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
}

/**
 * Brightness steps for one color: darker below 1, toward white above 1
 */
function buildShades(rgb: [number, number, number]): string[] {
  const shades: string[] = [];
  for (let step = 0; step < SHADE_STEPS; step++) {
    const brightness =
      MIN_BRIGHTNESS + ((MAX_BRIGHTNESS - MIN_BRIGHTNESS) * step) / (SHADE_STEPS - 1);
    const [r, g, b] = rgb.map((c) =>
      Math.round(brightness <= 1 ? c * brightness : c + (255 - c) * (brightness - 1))
    );
    shades.push(`rgb(${r}, ${g}, ${b})`);
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
  /** Brightness steps per color (null: a color the canvas can't parse, drawn as is) */
  private readonly shadeCache = new Map<string, string[] | null>();
  private readonly orientation = createOrientation();

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
   * rotation projected onto the screen, and its color is shaded by how much the
   * side facing the viewer faces the light
   */
  render(pool: ParticlePool): void {
    this.clear();
    const ctx = this.ctx;
    if (!ctx) return;

    const data = pool.data;
    const ratio = this.pixelRatio;
    const m = this.orientation;

    for (let i = 0; i < pool.activeCount; i++) {
      const idx = i * ParticleIndex.SIZE;

      // Pieces normally fall out of view; fade only if the lifetime runs out first
      const opacity = Math.min(
        1,
        data[idx + ParticleIndex.Life] / (data[idx + ParticleIndex.MaxLife] * LIFETIME_FADE)
      );
      const size = BASE_SIZE * data[idx + ParticleIndex.Scalar];
      if (size < 0.5 || opacity < 0.01) continue;

      orient(data, idx, m);

      // Paper is lit on both sides: use the normal of the side facing the viewer
      const facing = m[8] < 0 ? -1 : 1;
      const light = Math.max(0, facing * (m[6] * LIGHT_X + m[7] * LIGHT_Y + m[8] * LIGHT_Z));
      const color = pool.palette[data[idx + ParticleIndex.Color]];
      const shades = this.shadesFor(ctx, color);

      ctx.globalAlpha = opacity;
      ctx.fillStyle = shades ? shades[Math.round(light * (SHADE_STEPS - 1))] : color;
      ctx.setTransform(
        ratio * m[0],
        ratio * m[1],
        ratio * m[3],
        ratio * m[4],
        ratio * data[idx + ParticleIndex.X],
        ratio * data[idx + ParticleIndex.Y]
      );
      getShapeRenderer(data[idx + ParticleIndex.Shape])(ctx, size);
    }

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private shadesFor(ctx: CanvasRenderingContext2D, color: string): string[] | null {
    let shades = this.shadeCache.get(color);
    if (shades === undefined) {
      if (this.shadeCache.size >= MAX_SHADE_CACHE) this.shadeCache.clear();
      const rgb = parseColor(ctx, color);
      shades = rgb ? buildShades(rgb) : null;
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
