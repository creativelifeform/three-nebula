import {
  DEFAULT_BEHAVIOUR_EASING,
  DEFAULT_LIFE,
  DEFAULT_VORTEX_FALLOFF,
  DEFAULT_VORTEX_PULL,
  DEFAULT_VORTEX_SWIRL,
  VORTEX_MIN_DISTANCE,
} from './constants';

import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_VORTEX as type } from './types';
import type { EasingFunction, EaseName } from '../ease';
import type Particle from '../core/Particle';

interface VortexJSON {
  x: number;
  y: number;
  z: number;
  axisX: number;
  axisY: number;
  axisZ: number;
  swirl: number;
  pull: number;
  falloff: number;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

/**
 * Behaviour that swirls particles around an axis — a coherent tangential flow
 * field, with an optional inward/outward pull, for vortices, spell charge-ups,
 * tornados and orbiting motes.
 *
 * Unlike the radial point forces (`Attraction`/`Repulsion`), the swirl direction
 * is the tangent around the axis (`axis × radial`), so particles orbit rather
 * than converge. The force is applied to the particle's **velocity** (not
 * acceleration), so it is not subject to the `Force` 1:100 (MEASURE) scaling —
 * magnitudes are intuitive (tune `swirl`/`pull` in the hundreds). Deterministic
 * by construction (no randomness).
 */
export default class Vortex extends Behaviour {
  center: Vector3D;
  axis: Vector3D;
  swirl: number;
  pull: number;
  falloff: number;

  private _radial: Vector3D;
  private _tangential: Vector3D;
  private _axisProjection: Vector3D;

  /**
   * Constructs a Vortex behaviour instance.
   *
   * @param center - A point on the swirl axis
   * @param axis - The axis particles swirl around (normalised internally)
   * @param swirl - Tangential force scalar (orbit speed)
   * @param pull - Radial force scalar: inward (+) / outward (−)
   * @param falloff - Radial falloff exponent; force scales by 1 / dist^falloff
   * @param life - The life of the behaviour
   * @param easing - The behaviour's decaying trend
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    center: Vector3D = new Vector3D(),
    axis: Vector3D = new Vector3D(0, 0, 1),
    swirl: number = DEFAULT_VORTEX_SWIRL,
    pull: number = DEFAULT_VORTEX_PULL,
    falloff: number = DEFAULT_VORTEX_FALLOFF,
    life: number = DEFAULT_LIFE,
    easing: EasingFunction = DEFAULT_BEHAVIOUR_EASING,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    /**
     * @desc A point on the swirl axis
     */
    this.center = center;

    /**
     * @desc The (normalised) axis particles swirl around
     */
    this.axis = axis.clone().normalize();

    /**
     * @desc The tangential force scalar (orbit speed)
     */
    this.swirl = swirl;

    /**
     * @desc The radial force scalar; inward (+) / outward (−)
     */
    this.pull = pull;

    /**
     * @desc The radial falloff exponent
     */
    this.falloff = falloff;

    // Scratch vectors reused each mutate to avoid per-particle allocation.
    this._radial = new Vector3D();
    this._tangential = new Vector3D();
    this._axisProjection = new Vector3D();
  }

  /**
   * Resets the behaviour properties.
   */
  reset(
    center: Vector3D = new Vector3D(),
    axis: Vector3D = new Vector3D(0, 0, 1),
    swirl: number = DEFAULT_VORTEX_SWIRL,
    pull: number = DEFAULT_VORTEX_PULL,
    falloff: number = DEFAULT_VORTEX_FALLOFF,
    life?: number,
    easing?: EasingFunction
  ): void {
    this.center = center;
    this.axis = axis.clone().normalize();
    this.swirl = swirl;
    this.pull = pull;
    this.falloff = falloff;

    life && super.reset(life, easing);
  }

  /**
   * Mutates the particle's velocity, swirling it around the axis.
   *
   * @param particle - the particle to apply the behaviour to
   * @param time - particle engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    // Radial vector from the axis line to the particle: the component of
    // (position - center) perpendicular to the axis.
    this._radial.copy(particle.position).sub(this.center);

    const along = this._radial.dot(this.axis);

    this._radial.sub(this._axisProjection.copy(this.axis).scalar(along));

    const distance = this._radial.length();

    // On (or too near) the axis there is no well-defined tangent — leave it.
    if (distance < VORTEX_MIN_DISTANCE) {
      return;
    }

    const inverse = 1 / Math.pow(distance, this.falloff);

    // Tangential (axis × radial) drives the orbit; the radial term pulls in
    // (positive) or pushes out (negative). Both are integrated over time.
    this._tangential.copy(this.axis).cross(this._radial);

    particle.velocity
      .addScaledVector(this._tangential, this.swirl * inverse * time)
      .addScaledVector(this._radial, -this.pull * inverse * time);
  }

  /**
   * Creates a Vortex behaviour from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: VortexJSON): Vortex {
    const {
      x = 0,
      y = 0,
      z = 0,
      axisX = 0,
      axisY = 0,
      axisZ = 1,
      swirl,
      pull,
      falloff,
      life,
      easing,
      isEnabled = true,
    } = json;

    return new Vortex(
      new Vector3D(x, y, z),
      new Vector3D(axisX, axisY, axisZ),
      swirl,
      pull,
      falloff,
      life,
      getEasingByName(easing),
      isEnabled
    );
  }
}
