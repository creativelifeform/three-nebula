import { MathUtils, createColorSpan } from '../math';

import Behaviour from './Behaviour';
import { ColorUtil } from '../utils';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_COLOR as type } from './types';

/**
 * A behaviour which mutates the color of a particle over time.
 *
 */
export default class Color extends Behaviour {
  /**
   * Constructs a Color behaviour instance.
   *
   * @param {number|string} colorA - the starting color
   * @param {number|string} colorB - the ending color
   * @param {number} life - the life of the particle
   * @param {function} easing - The behaviour's decaying trend
   * @param {boolean} [isEnabled=true] - Determines if the behaviour will be applied or not
   * @return void
   */
  constructor(colorA, colorB, life, easing, isEnabled = true) {
    super(life, easing, type, isEnabled);

    this.reset(colorA, colorB);
  }

  /**
   * Gets the _same property which determines if the alpha are the same.
   *
   * @return {boolean}
   */
  get same() {
    return this._same;
  }

  /**
   * Sets the _same property which determines if the alpha are the same.
   *
   * @param {boolean} same
   * @return {boolean}
   */
  set same(same) {
    /**
     * @type {boolean}
     */
    this._same = same;
  }

  reset(colorA, colorB, life, easing) {
    this.same = colorB === null || colorB === undefined ? true : false;

    this.colorA = createColorSpan(colorA);
    this.colorB = createColorSpan(colorB);
    life && super.reset(life, easing);
  }

  initialize(particle) {
    particle.transform.colorA = ColorUtil.getRGB(this.colorA.getValue());

    particle.useColor = true;
    particle.transform.colorB = this.same
      ? particle.transform.colorA
      : ColorUtil.getRGB(this.colorB.getValue());
  }

  mutate(particle, time, index) {
    this.energize(particle, time, index);

    if (!this._same) {
      particle.color.r = MathUtils.lerp(
        particle.transform.colorA.r,
        particle.transform.colorB.r,
        this.energy
      );
      particle.color.g = MathUtils.lerp(
        particle.transform.colorA.g,
        particle.transform.colorB.g,
        this.energy
      );
      particle.color.b = MathUtils.lerp(
        particle.transform.colorA.b,
        particle.transform.colorB.b,
        this.energy
      );
    } else {
      particle.color.r = particle.transform.colorA.r;
      particle.color.g = particle.transform.colorA.g;
      particle.color.b = particle.transform.colorA.b;
    }
  }

  /**
   * Creates a Color initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {number} json.colorA - The starting color
   * @property {number} json.colorB - The ending color
   * @property {number} json.life - The life of the particle
   * @property {string} json.easing - The behaviour's decaying trend
   * @return {Color}
   */
  static fromJSON(json) {
    const { colorA, colorB, life, easing, isEnabled = true } = json;

    return new Color(colorA, colorB, life, getEasingByName(easing), isEnabled);
  }
}
