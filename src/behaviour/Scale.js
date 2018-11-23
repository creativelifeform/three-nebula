import { MathUtils, createSpan } from '../math';

import Behaviour from './Behaviour';
import { Util } from '../utils';

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

  reset(a, b, life, easing) {
    if (b == null || b == undefined) this._same = true;
    else this._same = false;

    this.a = createSpan(Util.initValue(a, 1));
    this.b = createSpan(b);

    life && Scale._super_.prototype.reset.call(this, life, easing);
  }

  initialize(particle) {
    particle.transform.scaleA = this.a.getValue();
    particle.transform.oldRadius = particle.radius;
    if (this._same) particle.transform.scaleB = particle.transform.scaleA;
    else particle.transform.scaleB = this.b.getValue();
  }

  applyBehaviour(particle, time, index) {
    Scale._super_.prototype.applyBehaviour.call(this, particle, time, index);
    particle.scale = MathUtils.lerp(
      particle.transform.scaleA,
      particle.transform.scaleB,
      this.energy
    );

    if (particle.scale < 0.0005) particle.scale = 0;
    particle.radius = particle.transform.oldRadius * particle.scale;
  }
}
