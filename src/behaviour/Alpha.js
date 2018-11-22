import { MathUtils, createSpan } from '../math';

import Behaviour from './Behaviour';
import { Util } from '../utils';

export default class Alpha extends Behaviour {
  /**
   * The Alpha class is the base for the other Behaviour
   *
   * @class Behaviour
   * @constructor
   */

  constructor(a, b, life, easing) {
    super(life, easing);

    this.reset(a, b);
    /**
     * The Behaviour name;
     * @property name
     * @type {string}
     */
    this.name = 'Alpha';
  }

  reset(a, b, life, easing) {
    if (b == null || b == undefined) this._same = true;
    else this._same = false;

    this.a = createSpan(Util.initValue(a, 1));
    this.b = createSpan(b);
    life && Alpha._super_.prototype.reset.call(this, life, easing);
  }

  initialize(particle) {
    particle.useAlpha = true;
    particle.transform.alphaA = this.a.getValue();
    if (this._same) particle.transform.alphaB = particle.transform.alphaA;
    else particle.transform.alphaB = this.b.getValue();
  }

  applyBehaviour(particle, time, index) {
    Alpha._super_.prototype.applyBehaviour.call(this, particle, time, index);

    particle.alpha = MathUtils.lerp(
      particle.transform.alphaA,
      particle.transform.alphaB,
      this.energy
    );
    if (particle.alpha < 0.002) particle.alpha = 0;
  }
}
