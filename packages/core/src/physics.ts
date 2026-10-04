import type { ParticlePool } from './particle';
import { ParticleIndex } from './types';

/**
 * Advance every particle by `dt`, measured in 60 fps frames (1 = 16.7 ms), so
 * motion and lifetime look the same at any refresh rate.
 * Returns true if there are still active particles.
 */
export function updateParticles(pool: ParticlePool, dt: number): boolean {
  const data = pool.data;

  for (let i = 0; i < pool.activeCount; i++) {
    const idx = i * ParticleIndex.SIZE;

    let vx = data[idx + ParticleIndex.VelocityX];
    let vy = data[idx + ParticleIndex.VelocityY];
    const tilt = data[idx + ParticleIndex.Tilt];

    // Gravity, then horizontal wobble based on tilt
    vy += data[idx + ParticleIndex.Gravity] * dt;
    vx += data[idx + ParticleIndex.Drift] * Math.sin(tilt) * dt;

    // Air resistance: decay is the share of speed kept per 60 fps frame
    const damping = data[idx + ParticleIndex.Decay] ** dt;
    vx *= damping;
    vy *= damping;

    data[idx + ParticleIndex.VelocityX] = vx;
    data[idx + ParticleIndex.VelocityY] = vy;
    data[idx + ParticleIndex.X] += vx * dt;
    data[idx + ParticleIndex.Y] += vy * dt;
    data[idx + ParticleIndex.Rotation] += data[idx + ParticleIndex.RotationSpeed] * dt;
    data[idx + ParticleIndex.Tilt] = tilt + data[idx + ParticleIndex.TiltSpeed] * dt;
    data[idx + ParticleIndex.Life] -= dt;
  }

  // Remove dead particles
  pool.compact();

  return pool.activeCount > 0;
}
