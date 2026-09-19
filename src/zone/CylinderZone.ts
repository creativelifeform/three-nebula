import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import type Particle from '../core/Particle';
import type { RNG } from '../math/rng';
import { ZONE_TYPE_CYLINDER as type } from './types';

const TWO_PI = Math.PI * 2;

/**
 * A solid cylinder zone aligned to +Y, centred at (x, y, z) — pillars, columns of
 * light/fire, beam volumes. A true 3D volume, so it works as a `CrossZone`
 * boundary (`_dead` kills particles that leave it; `_bound` reflects off the side
 * wall). v1 axis-aligned to +Y; arbitrary axis is a follow-up.
 */
export default class CylinderZone extends Zone {
  x: number;
  y: number;
  z: number;
  radius: number;
  height: number;

  constructor(
    centerX: number = 0,
    centerY: number = 0,
    centerZ: number = 0,
    radius: number = 100,
    height: number = 100
  ) {
    super(type);

    this.x = centerX;
    this.y = centerY;
    this.z = centerZ;
    this.radius = radius;
    this.height = height;
  }

  isCylinderZone(): boolean {
    return true;
  }

  getPosition(rng?: RNG): Vector3D {
    const rand = rng ?? Math.random;
    // Uniform over the disc cross-section (r = sqrt(u)·radius), uniform along
    // height (centred on y).
    this.random = rand();

    const r = Math.sqrt(this.random) * this.radius;
    const theta = TWO_PI * rand();
    const h = (rand() - 0.5) * this.height;

    this.vector.x = this.x + r * Math.cos(theta);
    this.vector.y = this.y + h;
    this.vector.z = this.z + r * Math.sin(theta);

    return this.vector;
  }

  _dead(particle: Particle): void {
    const dx = particle.position.x - this.x;
    const dy = particle.position.y - this.y;
    const dz = particle.position.z - this.z;
    const radial = Math.sqrt(dx * dx + dz * dz);

    if (
      radial - particle.radius > this.radius ||
      Math.abs(dy) - particle.radius > this.height / 2
    ) {
      particle.dead = true;
    }
  }

  _bound(particle: Particle): void {
    const dx = particle.position.x - this.x;
    const dz = particle.position.z - this.z;
    const radial = Math.sqrt(dx * dx + dz * dz) || 1e-6;

    // Reflect off the side wall (radial normal in the XZ plane); caps are left
    // open in v1.
    if (radial + particle.radius >= this.radius) {
      const nx = dx / radial;
      const nz = dz / radial;
      const k = 2 * (particle.velocity.x * nx + particle.velocity.z * nz);

      particle.velocity.x -= k * nx;
      particle.velocity.z -= k * nz;
    }
  }

  _cross(): void {
    console.warn(`${this.constructor.name} does not support the _cross method`);
  }
}
