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
 * Shape registry
 */
const shapes: Record<ShapeType, ShapeRenderer> = {
  circle: drawCircle,
  square: drawSquare,
};

/**
 * Get renderer for a shape type
 */
export function getShapeRenderer(shape: ShapeType): ShapeRenderer {
  return shapes[shape] ?? shapes.circle;
}

/**
 * Shape index for Float32Array storage
 */
export function shapeToIndex(shape: ShapeType): number {
  switch (shape) {
    case 'circle':
      return 0;
    case 'square':
      return 1;
    default:
      return 0;
  }
}

/**
 * Index to shape type
 */
export function indexToShape(index: number): ShapeType {
  switch (index) {
    case 0:
      return 'circle';
    case 1:
      return 'square';
    default:
      return 'circle';
  }
}
