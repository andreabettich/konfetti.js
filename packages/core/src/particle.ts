import { shapeToIndex } from './shapes';
import { ParticleIndex, type ResolvedOptions } from './types';
import { degToRad, randomItem, randomRange } from './utils';

/** Hard upper limit, so a runaway loop of fire() calls cannot eat memory */
export const MAX_PARTICLES = 10_000;

/** Above this many colors, unused ones are dropped from the palette */
const MAX_PALETTE = 256;

/**
 * Particle pool using Float32Array for performance
 * Each particle uses ParticleIndex.SIZE floats
 */
export class ParticlePool {
  /** Raw particle data */
  public data: Float32Array;
  /** Number of active particles */
  public activeCount = 0;
  /**
   * Colors in use; particles store an index into this list, so any CSS color
   * works without parsing it
   */
  public readonly palette: string[] = [];
  private readonly colorIds = new Map<string, number>();

  constructor(initialCapacity = 512) {
    this.data = new Float32Array(initialCapacity * ParticleIndex.SIZE);
  }

  /** How many particles fit before the buffer has to grow */
  get capacity(): number {
    return this.data.length / ParticleIndex.SIZE;
  }

  /**
   * Remove every particle
   */
  reset(): void {
    this.activeCount = 0;
    this.clearPalette();
  }

  /**
   * Spawn particles with the given options
   */
  spawn(options: ResolvedOptions, canvasWidth: number, canvasHeight: number): void {
    const count = Math.min(options.particleCount, MAX_PARTICLES - this.activeCount);
    if (count <= 0) return;
    this.ensureCapacity(this.activeCount + count);

    const data = this.data;
    const originX = options.origin.x * canvasWidth;
    const originY = options.origin.y * canvasHeight;
    const angleRad = degToRad(options.angle);
    const spreadRad = degToRad(options.spread);

    for (let i = 0; i < count; i++) {
      const idx = (this.activeCount + i) * ParticleIndex.SIZE;

      // Random angle within spread
      const particleAngle = angleRad + randomRange(-spreadRad / 2, spreadRad / 2);
      // Random velocity variation
      const velocity = options.startVelocity * randomRange(0.5, 1);

      // Position
      data[idx + ParticleIndex.X] = originX;
      data[idx + ParticleIndex.Y] = originY;

      // Velocity (negative Y because canvas Y is inverted)
      data[idx + ParticleIndex.VelocityX] = Math.cos(particleAngle) * velocity;
      data[idx + ParticleIndex.VelocityY] = -Math.sin(particleAngle) * velocity;

      // Rotation
      data[idx + ParticleIndex.Rotation] = randomRange(0, Math.PI * 2);
      data[idx + ParticleIndex.RotationSpeed] = randomRange(-0.1, 0.1);

      // Tilt (for wobble effect)
      data[idx + ParticleIndex.Tilt] = randomRange(0, Math.PI * 2);
      data[idx + ParticleIndex.TiltSpeed] = randomRange(0.05, 0.15);

      data[idx + ParticleIndex.Color] = this.colorId(randomItem(options.colors));
      data[idx + ParticleIndex.Shape] = shapeToIndex(randomItem(options.shapes));

      // Scalar (size)
      data[idx + ParticleIndex.Scalar] = options.scalar * randomRange(0.8, 1.2);

      // Life
      data[idx + ParticleIndex.Life] = options.ticks;
      data[idx + ParticleIndex.MaxLife] = options.ticks;

      // Physics are stored per particle so each burst keeps its own settings
      data[idx + ParticleIndex.Drift] = options.drift + randomRange(-0.5, 0.5);
      data[idx + ParticleIndex.Gravity] = options.gravity;
      data[idx + ParticleIndex.Decay] = options.decay;
    }

    this.activeCount += count;
  }

  /**
   * Remove dead particles, keeping live ones packed at the front
   */
  compact(): void {
    const data = this.data;
    let writeIdx = 0;

    for (let readIdx = 0; readIdx < this.activeCount; readIdx++) {
      const srcIdx = readIdx * ParticleIndex.SIZE;
      if (data[srcIdx + ParticleIndex.Life] <= 0) continue;

      if (writeIdx !== readIdx) {
        const dstIdx = writeIdx * ParticleIndex.SIZE;
        data.copyWithin(dstIdx, srcIdx, srcIdx + ParticleIndex.SIZE);
      }
      writeIdx++;
    }

    this.activeCount = writeIdx;
    if (writeIdx === 0) {
      this.clearPalette();
    } else if (this.palette.length > MAX_PALETTE) {
      this.prunePalette();
    }
  }

  /**
   * Keep only colors that live particles still use, renumbering them, so a long
   * stream with random colors does not grow the palette forever
   */
  private prunePalette(): void {
    const data = this.data;
    const oldPalette = [...this.palette];
    const remap = new Map<number, number>();
    this.clearPalette();

    for (let i = 0; i < this.activeCount; i++) {
      const idx = i * ParticleIndex.SIZE + ParticleIndex.Color;
      const oldId = data[idx];
      let newId = remap.get(oldId);
      if (newId === undefined) {
        newId = this.colorId(oldPalette[oldId]);
        remap.set(oldId, newId);
      }
      data[idx] = newId;
    }
  }

  private colorId(color: string): number {
    let id = this.colorIds.get(color);
    if (id === undefined) {
      id = this.palette.length;
      this.palette.push(color);
      this.colorIds.set(color, id);
    }
    return id;
  }

  private clearPalette(): void {
    this.palette.length = 0;
    this.colorIds.clear();
  }

  private ensureCapacity(needed: number): void {
    if (needed <= this.capacity) return;
    let capacity = this.capacity;
    while (capacity < needed) capacity *= 2;
    const grown = new Float32Array(Math.min(capacity, MAX_PARTICLES) * ParticleIndex.SIZE);
    grown.set(this.data.subarray(0, this.activeCount * ParticleIndex.SIZE));
    this.data = grown;
  }
}
