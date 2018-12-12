import { DEFAULT_BEHAVIOUR_EASING, DEFAULT_LIFE } from './constants';

import { MEASURE } from '../constants';
import { getEasingByName } from '../ease';
import { uid } from '../utils';

/**
 * The base behaviour class.
 * Behaviours manage a particle's behaviour after they have been emitted.
 *
 */
export default class Behaviour {
  /**
   * Constructs a Behaviour instance.
   *
   * @param {number} [life=Infinity] - The life of the behaviour
   * @param {function} [easing=DEFAULT_BEHAVIOUR_EASING] - The behaviour's decaying trend
   * @return void
   */
  constructor(life = Infinity, easing = DEFAULT_BEHAVIOUR_EASING) {
    /**
     * @desc The behaviour's id
     * @type {string} id
     */
    this.id = `behaviour-${uid()}`;

    /**
     * @desc The life of the behaviour
     * @type {number}
     */
    this.life = life;

    /**
     * @desc The behaviour's decaying trend
     * @type {function}
     */
    this.easing = easing;

    /**
     * @desc The age of the behaviour
     * @type {number}
     */
    this.age = 0;

    /**
     * @desc The energy of the behaviour
     * @type {number}
     */
    this.energy = 1;

    /**
     * Determines if the behaviour is dead or not
     * @type {boolean}
     */
    this.dead = false;

    /**
     * The behaviour name;
     * @property name
     * @type {string}
     */

    this.name = 'Behaviour';
  }

  /**
   * Reset this behaviour's parameters
   *
   * @param {number} [life=Infinity] - The life of the behaviour
   * @param {function} [easing=DEFAULT_BEHAVIOUR_EASING] - The behaviour's decaying trend
   */
  reset(life = Infinity, easing = DEFAULT_BEHAVIOUR_EASING) {
    this.life = life || DEFAULT_LIFE;
    this.easing = easing || DEFAULT_BEHAVIOUR_EASING;
  }

  /**
   * Normalize a force by 1:100;
   *
   * @param {Vector3D} force - The force to normalize.
   * @return {Vector3D}
   */
  normalizeForce(force) {
    return force.scalar(MEASURE);
  }

  /**
   * Normalize a value by 1:100;
   *
   * @param {number} value - The value to normalize
   * @return {number}
   */
  normalizeValue(value) {
    return value * MEASURE;
  }

  /**
   * Set the behaviour's initial properties on the particle.
   *
   * @param {Particle} particle
   * @abstract
   */
  initialize(particle) {} // eslint-disable-line

  /**
   * Compares the age of the behaviour vs integration time and determines
   * if the behaviour should be set to dead or not.
   * Sets the behaviour energy as a factor of particle age and life.
   *
   * TODO It's a little weird that sub class behaviours override this method and
   * also call it from within their own applyBehaviour method. Since this method
   * primarily sets energy, consider renaming it to setEnergy or energise. Then
   * each sub class can simply call this.setEnergy instead of super.applyBehaviour.
   *
   * @param {Particle} particle - The particle to apply the behaviour to
   * @param {Number} time - the proton integration time
   * @return void
   */
  applyBehaviour(particle, time) {
    if (this.dead) {
      return;
    }

    this.age += time;

    if (this.age >= this.life) {
      this.energy = 0;
      this.dead = true;

      return;
    }

    const scale = this.easing(particle.age / particle.life);

    this.energy = Math.max(1 - scale, 0);
  }

  /**
   * Destory this behaviour.
   *
   * @abstract
   */
  destroy() {}

  /**
   * Returns a new instance of the behaviour from the JSON object passed.
   *
   * @abstract
   * @param {object} json - JSON object containing the required constructor properties
   * @return {Behaviour}
   */
  fromJSON(json) {} // eslint-disable-line
}
