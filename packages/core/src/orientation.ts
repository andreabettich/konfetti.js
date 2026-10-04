import { ParticleIndex } from './types';

/**
 * 3D orientation of a particle, as the columns of its rotation
 * matrix: where the piece's local x axis, local y axis and surface normal point.
 * Layout: [xAxis.x, xAxis.y, xAxis.z, yAxis.x, yAxis.y, yAxis.z, normal.x, normal.y, normal.z]
 */
export type Orientation = Float64Array;

export function createOrientation(): Orientation {
  return new Float64Array(9);
}

/**
 * Fill `out` with the particle's rotation: flip (Tilt) around its x axis, then
 * Wobble around its y axis, then Rotation in the screen plane
 */
export function orient(data: Float32Array, idx: number, out: Orientation): Orientation {
  const tilt = data[idx + ParticleIndex.Tilt];
  const wobble = data[idx + ParticleIndex.Wobble];
  const rotation = data[idx + ParticleIndex.Rotation];
  const cx = Math.cos(tilt);
  const sx = Math.sin(tilt);
  const cy = Math.cos(wobble);
  const sy = Math.sin(wobble);
  const cz = Math.cos(rotation);
  const sz = Math.sin(rotation);

  out[0] = cz * cy;
  out[1] = sz * cy;
  out[2] = -sy;
  out[3] = cz * sy * sx - sz * cx;
  out[4] = sz * sy * sx + cz * cx;
  out[5] = cy * sx;
  out[6] = cz * sy * cx + sz * sx;
  out[7] = sz * sy * cx - cz * sx;
  out[8] = cy * cx;
  return out;
}
