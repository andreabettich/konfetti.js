import { createOrientation, orient } from './orientation';
import type { ParticlePool } from './particle';
import { ParticleIndex } from './types';

/** Paper is light: pieces feel this share of the gravity setting */
const PAPER_GRAVITY = 0.45;
/** Air resistance on falling paper, which grows with the square of the speed */
const FALL_DRAG = 0.0475;
/**
 * Above this falling speed (px per frame) the drag only grows linearly, so pieces
 * launched downward fly out like the rest of the burst instead of stopping dead
 */
const FLUTTER_SPEED = 4;
/** How strongly a tilted piece glides sideways while falling (the falling-leaf sway) */
const GLIDE = 0.6;
/** Speed of the slow side-to-side air movement, in px per 60 fps frame */
const AIR_SWAY = 1;
/** How far past the edges a piece may go before it is removed, in CSS px */
const OFFSCREEN_MARGIN = 60;

const orientation = createOrientation();

/**
 * Advance every particle by `dt`, measured in 60 fps frames (1 = 16.7 ms), so
 * motion and lifetime look the same at any refresh rate. `width` and `height`
 * are the canvas size, used to remove pieces that left the screen.
 * Returns true if there are still active particles.
 */
export function updateParticles(
  pool: ParticlePool,
  dt: number,
  width: number,
  height: number
): boolean {
  const data = pool.data;

  for (let i = 0; i < pool.activeCount; i++) {
    updateParticle(data, i * ParticleIndex.SIZE, dt, width, height);
  }

  // Remove dead particles
  pool.compact();

  return pool.activeCount > 0;
}

/**
 * Paper in air: the launch slows quickly, then the piece settles into a slow,
 * swaying descent whose speed depends on how it is turned, and it tumbles
 * faster the faster it moves
 */
function updateParticle(
  data: Float32Array,
  idx: number,
  dt: number,
  width: number,
  height: number
): void {
  let vx = data[idx + ParticleIndex.VelocityX];
  let vy = data[idx + ParticleIndex.VelocityY];
  orient(data, idx, orientation);
  const nx = orientation[6];
  const ny = orientation[7];

  vy += data[idx + ParticleIndex.Gravity] * PAPER_GRAVITY * dt;

  if (vy > 0) {
    // Falling flat (normal pointing up or down) catches the most air
    const drag = FALL_DRAG * (0.35 + 0.65 * Math.abs(ny));
    vy = Math.max(0, vy - drag * vy * Math.min(vy, FLUTTER_SPEED) * dt);
    // A tilted piece glides toward its lower edge; the direction flips as it tumbles
    vx += GLIDE * vy * 2 * nx * ny * dt;
  }

  // The air itself moves: steady wind (drift) plus a slow sway. Decay pulls the
  // piece toward the air's speed rather than toward standing still.
  const phase = data[idx + ParticleIndex.AirPhase];
  const airX = data[idx + ParticleIndex.Drift] + AIR_SWAY * Math.sin(phase);
  const damping = data[idx + ParticleIndex.Decay] ** dt;
  vx = airX + (vx - airX) * damping;
  vy *= damping;

  // Autorotation: fast-moving paper flips faster
  const spin = 0.6 + Math.min(1.4, Math.hypot(vx, vy) / 3);

  data[idx + ParticleIndex.VelocityX] = vx;
  data[idx + ParticleIndex.VelocityY] = vy;
  data[idx + ParticleIndex.X] += vx * dt;
  data[idx + ParticleIndex.Y] += vy * dt;
  data[idx + ParticleIndex.Tilt] += data[idx + ParticleIndex.TiltSpeed] * spin * dt;
  data[idx + ParticleIndex.Wobble] += data[idx + ParticleIndex.WobbleSpeed] * dt;
  data[idx + ParticleIndex.Rotation] += data[idx + ParticleIndex.RotationSpeed] * dt;
  data[idx + ParticleIndex.AirPhase] = phase + data[idx + ParticleIndex.AirPhaseSpeed] * dt;
  data[idx + ParticleIndex.Life] -= dt;

  // Gone once it has fallen out of view (pieces may start above or beside it)
  const x = data[idx + ParticleIndex.X];
  const y = data[idx + ParticleIndex.Y];
  if (
    y > height + OFFSCREEN_MARGIN ||
    x < -OFFSCREEN_MARGIN * 2 ||
    x > width + OFFSCREEN_MARGIN * 2
  ) {
    data[idx + ParticleIndex.Life] = 0;
  }
}
