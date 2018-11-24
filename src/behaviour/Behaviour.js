import { Util, uid } from '../utils';
import { ease, setEasingByName } from '../ease';

import { MEASURE } from '../constants';

const { easeLinear } = ease;

export default class Behaviour {
  constructor(life, easing) {
    /**
     * The behaviour's id;
     * @property id
     * @type {String} id
     */
    this.id = `Behaviour_${uid()}`;
    this.life = Util.initValue(life, Infinity);

    /**
     * The behaviour's decaying trend, for example easeOutQuart;
     * @property easing
     * @type {String}
     * @default easeLinear
     */
    this.easing = Util.initValue(easing, setEasingByName(easeLinear));
    this.age = 0;
    this.energy = 1;
    /**
     * The behaviour is Dead;
     * @property dead
     * @type {Boolean}
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
   * @method reset
   * @param {Number} this behaviour's life
   * @param {String} this behaviour's easing
   */
  reset(life, easing) {
    this.life = Util.initValue(life, Infinity);
    this.easing = Util.initValue(easing, setEasingByName(easeLinear));
  }
  /**
   * Normalize a force by 1:100;
   *
   * @method normalizeForce
   * @param {Vector2D} force
   */
  normalizeForce(force) {
    return force.scalar(MEASURE);
  }

  /**
   * Normalize a value by 1:100;
   *
   * @method normalizeValue
   * @param {Number} value
   */
  normalizeValue(value) {
    return value * MEASURE;
  }

  /**
   * Initialize the behaviour's parameters for all particles
   *
   * @method initialize
   * @param {Particle} particle
   * @abstract
   */
  initialize(particle) {} // eslint-disable-line

  /**
   * Apply this behaviour for all particles every time
   *
   * @method applyBehaviour
   * @param {Particle} particle
   * @param {Number} the integrate time 1/ms
   */
  applyBehaviour(particle, time) {
    if (this.dead) return;

    this.age += time;

    if (this.age >= this.life) {
      this.energy = 0;
      this.dead = true;

      return;
    }

    var scale = this.easing(particle.age / particle.life);

    this.energy = Math.max(1 - scale, 0);
  }

  /**
   * Destory this behaviour
   * @method destroy
   */
  destroy() {}
}
