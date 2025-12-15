import { shapeToIndex } from './shapes';
import { ParticleIndex, type ResolvedOptions, type ShapeType } from './types';
import { degToRad, hexToRgb, packColor, randomItem, randomRange } from './utils';

/**
 * Particle pool using Float32Array for performance
 * Each particle uses ParticleIndex.SIZE floats
 */
export class ParticlePool {
  /** Raw particle data */
  public data: Float32Array;
  /** Number of active particles */
  public activeCount: number = 0;
  /** Maximum particles this pool can hold */
  public readonly maxParticles: number;

  constructor(maxParticles: number = 500) {
    this.maxParticles = maxParticles;
    this.data = new Float32Array(maxParticles * ParticleIndex.SIZE);
  }

  /**
   * Reset pool
   */
  reset(): void {
    this.activeCount = 0;
  }

  /**
   * Spawn particles with the given options
   */
  spawn(options: ResolvedOptions, canvasWidth: number, canvasHeight: number): void {
    const count = Math.min(options.particleCount, this.maxParticles - this.activeCount);

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
      this.data[idx + ParticleIndex.X] = originX;
      this.data[idx + ParticleIndex.Y] = originY;

      // Velocity (negative Y because canvas Y is inverted)
      this.data[idx + ParticleIndex.VelocityX] = Math.cos(particleAngle) * velocity;
      this.data[idx + ParticleIndex.VelocityY] = -Math.sin(particleAngle) * velocity;

      // Rotation
      this.data[idx + ParticleIndex.Rotation] = randomRange(0, Math.PI * 2);
      this.data[idx + ParticleIndex.RotationSpeed] = randomRange(-0.1, 0.1);

      // Tilt (for wobble effect)
      this.data[idx + ParticleIndex.Tilt] = randomRange(0, Math.PI * 2);
      this.data[idx + ParticleIndex.TiltSpeed] = randomRange(0.05, 0.15);

      // Color (packed as single float)
      const colorHex = randomItem(options.colors);
      const { r, g, b } = hexToRgb(colorHex);
      this.data[idx + ParticleIndex.Color] = packColor(r, g, b);

      // Shape
      const shape: ShapeType = randomItem(options.shapes);
      this.data[idx + ParticleIndex.Shape] = shapeToIndex(shape);

      // Scalar (size)
      this.data[idx + ParticleIndex.Scalar] = options.scalar * randomRange(0.8, 1.2);

      // Life
      this.data[idx + ParticleIndex.Life] = options.ticks;
      this.data[idx + ParticleIndex.MaxLife] = options.ticks;

      // Drift
      this.data[idx + ParticleIndex.Drift] = options.drift + randomRange(-0.5, 0.5);
    }

    this.activeCount += count;
  }

  /**
   * Get particle data at index
   */
  getParticle(particleIndex: number): {
    x: number;
    y: number;
    rotation: number;
    tilt: number;
    color: number;
    shape: number;
    scalar: number;
    life: number;
    maxLife: number;
  } {
    const idx = particleIndex * ParticleIndex.SIZE;
    return {
      x: this.data[idx + ParticleIndex.X],
      y: this.data[idx + ParticleIndex.Y],
      rotation: this.data[idx + ParticleIndex.Rotation],
      tilt: this.data[idx + ParticleIndex.Tilt],
      color: this.data[idx + ParticleIndex.Color],
      shape: this.data[idx + ParticleIndex.Shape],
      scalar: this.data[idx + ParticleIndex.Scalar],
      life: this.data[idx + ParticleIndex.Life],
      maxLife: this.data[idx + ParticleIndex.MaxLife],
    };
  }

  /**
   * Remove dead particles by swapping with last active
   */
  compact(): void {
    let writeIdx = 0;

    for (let readIdx = 0; readIdx < this.activeCount; readIdx++) {
      const idx = readIdx * ParticleIndex.SIZE;
      const life = this.data[idx + ParticleIndex.Life];

      if (life > 0) {
        if (writeIdx !== readIdx) {
          // Copy particle data
          const srcIdx = readIdx * ParticleIndex.SIZE;
          const dstIdx = writeIdx * ParticleIndex.SIZE;
          for (let j = 0; j < ParticleIndex.SIZE; j++) {
            this.data[dstIdx + j] = this.data[srcIdx + j];
          }
        }
        writeIdx++;
      }
    }

    this.activeCount = writeIdx;
  }
}
