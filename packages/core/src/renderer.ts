import type { ParticlePool } from './particle';
import { getShapeRenderer, indexToShape } from './shapes';
import { ParticleIndex } from './types';
import { unpackColor } from './utils';

/**
 * Canvas renderer for particles
 */
export class Renderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isGlobalCanvas: boolean = false;
  private zIndex: number = 100;

  /** Base particle size in pixels */
  private readonly baseSize = 10;

  /**
   * Initialize renderer with canvas
   */
  init(canvas?: HTMLCanvasElement, zIndex: number = 100): void {
    this.zIndex = zIndex;

    if (canvas) {
      // Use provided canvas
      this.canvas = canvas;
      this.isGlobalCanvas = false;
    } else {
      // Create global canvas
      this.canvas = this.createGlobalCanvas();
      this.isGlobalCanvas = true;
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  /**
   * Create a full-screen overlay canvas
   */
  private createGlobalCanvas(): HTMLCanvasElement {
    // Check if we already have one
    let canvas = document.getElementById('konfetti-canvas') as HTMLCanvasElement;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'konfetti-canvas';
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: ${this.zIndex};
      `;
      document.body.appendChild(canvas);
    }

    return canvas;
  }

  /**
   * Resize canvas to match container/window
   */
  resize(): void {
    if (!this.canvas) return;

    if (this.isGlobalCanvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    } else {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.canvas?.width ?? window.innerWidth,
      height: this.canvas?.height ?? window.innerHeight,
    };
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render all particles
   * Uses color batching for performance
   */
  render(pool: ParticlePool): void {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const data = pool.data;

    // Group particles by color for batch rendering
    const colorGroups = new Map<number, number[]>();

    for (let i = 0; i < pool.activeCount; i++) {
      const idx = i * ParticleIndex.SIZE;
      const color = data[idx + ParticleIndex.Color];

      if (!colorGroups.has(color)) {
        colorGroups.set(color, []);
      }
      colorGroups.get(color)!.push(i);
    }

    // Render each color group
    for (const [packedColor, particleIndices] of colorGroups) {
      const { r, g, b } = unpackColor(packedColor);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      for (const particleIdx of particleIndices) {
        const idx = particleIdx * ParticleIndex.SIZE;

        const x = data[idx + ParticleIndex.X];
        const y = data[idx + ParticleIndex.Y];
        const rotation = data[idx + ParticleIndex.Rotation];
        const tilt = data[idx + ParticleIndex.Tilt];
        const scalar = data[idx + ParticleIndex.Scalar];
        const life = data[idx + ParticleIndex.Life];
        const maxLife = data[idx + ParticleIndex.MaxLife];
        const shapeIdx = data[idx + ParticleIndex.Shape];

        // Calculate opacity based on remaining life
        const lifeRatio = life / maxLife;
        const opacity = Math.min(1, lifeRatio * 2); // Fade out in last 50% of life

        // Calculate size with wobble
        const size = this.baseSize * scalar * (0.8 + 0.2 * Math.cos(tilt));

        // Skip if too small or invisible
        if (size < 0.5 || opacity < 0.01) continue;

        // Save context state
        ctx.save();

        // Apply transformations
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Apply 3D-like tilt effect
        ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.cos(tilt)));

        // Draw shape
        const shape = indexToShape(shapeIdx);
        const renderer = getShapeRenderer(shape);
        renderer(ctx, size);

        // Restore context state
        ctx.restore();
      }
    }
  }

  /**
   * Destroy renderer and clean up
   */
  destroy(): void {
    if (this.isGlobalCanvas && this.canvas) {
      this.canvas.remove();
    }
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Check if renderer has a valid canvas
   */
  isReady(): boolean {
    return this.canvas !== null && this.ctx !== null;
  }
}
