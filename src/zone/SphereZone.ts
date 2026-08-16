import { PI } from '../constants';
import Util from '../utils/Util';
import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import type Particle from '../core/Particle';
import type { RNG } from '../math/rng';
import { ZONE_TYPE_SPHERE as type } from './types';

// Scratch vectors reused across _bound calls (matches the original closure).
const _boundNormal = new Vector3D();
const _boundV = new Vector3D();

/**
 * A spherical zone for particles to be emitted within.
 */
export default class SphereZone extends Zone {
  x: number;
  y: number;
  z: number;
  radius: number;
  the: number;
  phi: number;

  constructor(
    centerX?: number,
    centerY?: number,
    centerZ?: number,
    radius?: number
  ) {
    super(type);

    let x = 0;
    let r = 100;

    if (Util.isUndefined(centerY, centerZ, radius)) {
      r = centerX || 100;
    } else {
      x = centerX as number;
      r = radius as number;
    }

    this.x = x;

    // TODO shouldn't this be set to y?
    this.y = x;

    // TODO shouldn't this be set to z?
    this.z = x;
    this.radius = r;
    this.the = this.phi = 0;
  }

  isSphereZone(): boolean {
    return true;
  }

  getPosition(rng?: RNG): Vector3D {
    const rand = rng ?? Math.random;

    this.random = rand();

    const r = this.random * this.radius;
    const tha = PI * rand(); //[0-pi]
    const phi = PI * 2 * rand(); //[0-2pi]

    this.vector.x = this.x + r * Math.sin(tha) * Math.cos(phi);
    this.vector.y = this.y + r * Math.sin(phi) * Math.sin(tha);
    this.vector.z = this.z + r * Math.cos(tha);

    return this.vector;
  }

  _dead(particle: Particle): void {
    const d = particle.position.distanceTo(this);

    if (d - particle.radius > this.radius) particle.dead = true;
  }

  _bound(particle: Particle): void {
    const d = particle.position.distanceTo(this);

    if (d + particle.radius >= this.radius) {
      _boundNormal.copy(particle.position).sub(this).normalize();
      _boundV.copy(particle.velocity);
      const k = 2 * _boundV.dot(_boundNormal);
      particle.velocity.sub(_boundNormal.scalar(k));
    }
  }

  _cross(): void {
    console.warn(`${this.constructor.name} does not support the _cross method`);
  }
}
