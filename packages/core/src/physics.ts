import type { ParticlePool } from './particle';
import { ParticleIndex, type ResolvedOptions } from './types';

/**
 * Physics engine for particle simulation
 */
export class PhysicsEngine {
  private decay: number = 0.9;
  private gravity: number = 1;

  /**
   * Update physics settings
   */
  configure(options: ResolvedOptions): void {
    this.decay = options.decay;
    this.gravity = options.gravity;
  }

  /**
   * Update all particles in the pool
   * Returns true if there are still active particles
   */
  update(pool: ParticlePool): boolean {
    const data = pool.data;

    for (let i = 0; i < pool.activeCount; i++) {
      const idx = i * ParticleIndex.SIZE;

      // Get current values
      let x = data[idx + ParticleIndex.X];
      let y = data[idx + ParticleIndex.Y];
      let vx = data[idx + ParticleIndex.VelocityX];
      let vy = data[idx + ParticleIndex.VelocityY];
      const rotation = data[idx + ParticleIndex.Rotation];
      const rotationSpeed = data[idx + ParticleIndex.RotationSpeed];
      const tilt = data[idx + ParticleIndex.Tilt];
      const tiltSpeed = data[idx + ParticleIndex.TiltSpeed];
      const drift = data[idx + ParticleIndex.Drift];
      let life = data[idx + ParticleIndex.Life];

      // Apply gravity
      vy += this.gravity;

      // Apply drift (horizontal wobble based on tilt)
      vx += drift * Math.sin(tilt);

      // Apply decay (air resistance)
      vx *= this.decay;
      vy *= this.decay;

      // Update position
      x += vx;
      y += vy;

      // Update rotation
      const newRotation = rotation + rotationSpeed;
      const newTilt = tilt + tiltSpeed;

      // Decrease life
      life -= 1;

      // Store updated values
      data[idx + ParticleIndex.X] = x;
      data[idx + ParticleIndex.Y] = y;
      data[idx + ParticleIndex.VelocityX] = vx;
      data[idx + ParticleIndex.VelocityY] = vy;
      data[idx + ParticleIndex.Rotation] = newRotation;
      data[idx + ParticleIndex.Tilt] = newTilt;
      data[idx + ParticleIndex.Life] = life;
    }

    // Remove dead particles
    pool.compact();

    return pool.activeCount > 0;
  }
}
