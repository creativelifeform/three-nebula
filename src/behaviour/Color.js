import { MathUtils, createArraySpan } from '../math';

import Behaviour from './Behaviour';
import { ColorUtil } from '../utils';
import { getEasingByName } from '../ease';

/**
 * A behaviour which mutates the color of a particle over time.
 *
 */
export default class Color extends Behaviour {
  /**
   * Constructs a Color behaviour instance.
   *
   * @param {number|string} a - the starting color
   * @param {number|string} b - the ending color
   * @param {number} life - the life of the particle
   * @param {function} easing - The behaviour's decaying trend
   */
  constructor(a, b, life, easing) {
    super(life, easing);

    this.reset(a, b);
    this.name = 'Color';
  }

  reset(a, b, life, easing) {
    if (b == null || b == undefined) this._same = true;
    else this._same = false;

    this.a = createArraySpan(a);
    this.b = createArraySpan(b);
    life && super.reset(life, easing);
  }

  initialize(particle) {
    particle.transform.colorA = ColorUtil.getRGB(this.a.getValue());

    particle.useColor = true;
    if (this._same) particle.transform.colorB = particle.transform.colorA;
    else particle.transform.colorB = ColorUtil.getRGB(this.b.getValue());
  }

  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

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
  fromJSON(json) {
    const { colorA, colorB, life, easing } = json;

    return new Color(colorA, colorB, life, getEasingByName(easing));
  }
}
