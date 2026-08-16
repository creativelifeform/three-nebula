import { MEASURE, PI } from '../../constants';
import { MathUtils, Span, Vector3D } from '../../math';

import Initializer from '../Initializer';
import type Emitter from '../../emitter/Emitter';
import type Particle from '../../core/Particle';

// Scratch vectors reused across initialize calls (matches the original closure).
const normal = new Vector3D(0, 0, 1);
const v = new Vector3D(0, 0, 0);

/**
 * Abstract class for Velocity initializers.
 *
 */
export default class Velocity extends Initializer {
  dirVec: Vector3D;
  tha: number;
  _useV: boolean;
  dir: Vector3D;
  radiusPan: Span<number>;

  /**
   * Constructs a Velocity intitializer instance.
   */
  constructor(type: string, isEnabled: boolean = true) {
    super(type, isEnabled);

    /**
     * @desc Directional vector
     */
    this.dirVec = new Vector3D(0, 0, 0);
  }

  normalize(vr: number): number {
    return vr * MEASURE;
  }

  /**
   * Sets the particle's initial velocity.
   *
   * @param particle - the particle to initialize the property on
   */
  initialize(particle: Emitter | Particle): void {
    const tha = this.tha * particle.rng();

    this._useV &&
      this.dirVec
        .copy(this.dir)
        .scalar(this.radiusPan.getValue(undefined, particle.rng));

    MathUtils.getNormal(this.dirVec, normal);
    v.copy(this.dirVec).applyAxisAngle(normal, tha);
    v.applyAxisAngle(this.dirVec.normalize(), particle.rng() * PI * 2);

    particle.velocity.copy(v);
  }
}
