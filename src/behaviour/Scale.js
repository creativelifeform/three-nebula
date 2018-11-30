import { MathUtils, createSpan } from '../math';

import Behaviour from './Behaviour';
import { Util } from '../utils';

/**
 * Behaviour that scales particles.
 *
 */
export default class Scale extends Behaviour {
  /**
   * The Scale class is the base for the other Behaviour
   *
   * @class Behaviour
   * @constructor
   */
  constructor(a, b, life, easing) {
    super(life, easing);

    this.reset(a, b);
    this.name = 'Scale';
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {number} scaleA - the starting scale value
   * @param {?number} scaleB - the ending scale value
   * @param {number} life - the life of the behaviour
   * @param {function} easing - the easing equation to use for transforms
   * @return void
   */
  reset(a, b, life, easing) {
    if (b == null || b == undefined) this._same = true;
    else this._same = false;

    /**
     * @desc The starting scale.
     * @type {Span}
     */
    this.a = createSpan(Util.initValue(a, 1));

    /**
     * @desc The ending scale.
     * @type {Span}
     */
    this.b = createSpan(b);

    life && super.reset(life, easing);
  }

  /**
   * Initializes the behaviour on a particle.
   * Stores initial values for comparison and mutation in the applyBehaviour method.
   *
   * @param {object} particle - the particle to initialize the behaviour on
   * @return void
   */
  initialize(particle) {
    particle.transform.scaleA = this.a.getValue();
    particle.transform.oldRadius = particle.radius;
    if (this._same) particle.transform.scaleB = particle.transform.scaleA;
    else particle.transform.scaleB = this.b.getValue();
  }

  /**
   * Applies the behaviour to the particle.
   * Mutates the particle's scale and its radius according to this scale.
   *
   * @param {object} particle - the particle to apply the behaviour to
   * @param {number} time - engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    particle.scale = MathUtils.lerp(
      particle.transform.scaleA,
      particle.transform.scaleB,
      this.energy
    );

    if (particle.scale < 0.0005) {
      particle.scale = 0;
    }

    particle.radius = particle.transform.oldRadius * particle.scale;
  }
}
