import type { ShapeType } from './types';

/**
 * Shape rendering functions
 * Each shape function draws centered at (0, 0) with the given size
 */
export type ShapeRenderer = (ctx: CanvasRenderingContext2D, size: number) => void;

/**
 * Draw a circle
 */
function drawCircle(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a square
 */
function drawSquare(ctx: CanvasRenderingContext2D, size: number): void {
  const halfSize = size / 2;
  ctx.fillRect(-halfSize, -halfSize, size, size);
}

/**
 * Supported shapes; a particle stores its shape as an index into this list
 */
const SHAPES: readonly ShapeType[] = ['circle', 'square'];

const RENDERERS: readonly ShapeRenderer[] = [drawCircle, drawSquare];

/**
 * Whether a value is a supported shape name
 */
export function isShape(value: unknown): value is ShapeType {
  return SHAPES.includes(value as ShapeType);
}

/**
 * Shape index for Float32Array storage
 */
export function shapeToIndex(shape: ShapeType): number {
  return Math.max(0, SHAPES.indexOf(shape));
}

/**
 * Get the renderer for a stored shape index
 */
export function getShapeRenderer(index: number): ShapeRenderer {
  return RENDERERS[index] ?? drawCircle;
}
