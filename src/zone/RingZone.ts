import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import type { RNG } from '../math/rng';
import { ZONE_TYPE_RING as type } from './types';

const TWO_PI = Math.PI * 2;

/**
 * A ring (annulus) zone in the XZ plane (normal +Y), for particles to be emitted
 * within — frost novas, shockwave rings, summoning circles, AoE ground markers.
 *
 * Planar (zero thickness), so it is emission-first: it has no meaningful 3D
 * inside/outside, and `supportsCrossing` is false (a `CrossZone` using it warns
 * rather than misbehaving). v1 is axis-aligned to +Y; arbitrary axis is a
 * follow-up.
 */
export default class RingZone extends Zone {
  x: number;
  y: number;
  z: number;
  innerRadius: number;
  outerRadius: number;

  constructor(
    centerX: number = 0,
    centerY: number = 0,
    centerZ: number = 0,
    innerRadius: number = 0,
    outerRadius: number = 100
  ) {
    super(type);

    this.x = centerX;
    this.y = centerY;
    this.z = centerZ;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    // Planar → no 3D boundary; emission-first (see class doc).
    this.supportsCrossing = false;
  }

  getPosition(rng?: RNG): Vector3D {
    const rand = rng ?? Math.random;
    // Uniform *area* sampling of the annulus: r = sqrt(lerp(inner², outer², u)),
    // otherwise particles cluster toward the inner edge.
    const inner2 = this.innerRadius * this.innerRadius;
    const outer2 = this.outerRadius * this.outerRadius;

    this.random = rand();

    const r = Math.sqrt(inner2 + (outer2 - inner2) * this.random);
    const theta = TWO_PI * rand();

    this.vector.x = this.x + r * Math.cos(theta);
    this.vector.y = this.y;
    this.vector.z = this.z + r * Math.sin(theta);

    return this.vector;
  }
}
