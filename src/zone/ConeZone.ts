import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import type Particle from '../core/Particle';
import type { RNG } from '../math/rng';
import { ZONE_TYPE_CONE as type } from './types';

const TWO_PI = Math.PI * 2;

/**
 * A solid cone zone: apex at (x, y, z), opening along +Y, widening to `radius`
 * over `height` — cones of cold, sprays, fountains, upward breath. A 3D volume,
 * so it works as a `CrossZone` boundary via `_dead` (a particle outside the cone
 * dies). Reflection (`_bound`/`_cross`) is not supported in v1. Axis-aligned to
 * +Y; arbitrary direction (e.g. horizontal dragon-breath) is a follow-up.
 */
export default class ConeZone extends Zone {
  x: number;
  y: number;
  z: number;
  radius: number;
  height: number;

  constructor(
    apexX: number = 0,
    apexY: number = 0,
    apexZ: number = 0,
    radius: number = 100,
    height: number = 100
  ) {
    super(type);

    this.x = apexX;
    this.y = apexY;
    this.z = apexZ;
    this.radius = radius;
    this.height = height;
  }

  getPosition(rng?: RNG): Vector3D {
    const rand = rng ?? Math.random;
    // Uniform over the cone volume: the height fraction's density grows with the
    // cross-section (∝ h²), so h = cbrt(u); then a uniform disc at that height.
    this.random = rand();

    const h = Math.cbrt(this.random);
    const rMax = h * this.radius;
    const r = Math.sqrt(rand()) * rMax;
    const theta = TWO_PI * rand();

    this.vector.x = this.x + r * Math.cos(theta);
    this.vector.y = this.y + h * this.height;
    this.vector.z = this.z + r * Math.sin(theta);

    return this.vector;
  }

  _dead(particle: Particle): void {
    const dy = particle.position.y - this.y;

    // Beyond the cone's height band → dead.
    if (dy < -particle.radius || dy - particle.radius > this.height) {
      particle.dead = true;

      return;
    }

    const dx = particle.position.x - this.x;
    const dz = particle.position.z - this.z;
    const radial = Math.sqrt(dx * dx + dz * dz);
    // Allowed radius grows linearly from apex (0) to base (radius).
    const allowed = (Math.max(dy, 0) / this.height) * this.radius;

    if (radial - particle.radius > allowed) {
      particle.dead = true;
    }
  }

  _bound(): void {
    console.warn(`${this.constructor.name} does not support the _bound method`);
  }

  _cross(): void {
    console.warn(`${this.constructor.name} does not support the _cross method`);
  }
}
