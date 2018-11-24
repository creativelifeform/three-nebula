import { MathUtils, Vector3D, createSpan } from '../math';

import Behaviour from './Behaviour';

export default class RandomDrift extends Behaviour {
  /**
   * The Behaviour class is the base for the other Behaviour
   *
   * @class Behaviour
   * @constructor
   */
  constructor(driftX, driftY, driftZ, delay, life, easing) {
    super(life, easing);

    this.reset(driftX, driftY, driftZ, delay);
    this.time = 0;
    this.name = 'RandomDrift';
  }

  reset(driftX, driftY, driftZ, delay, life, easing) {
    this.randomFoce = this.normalizeForce(new Vector3D(driftX, driftY, driftZ));
    this.delayPan = createSpan(delay || 0.03);
    this.time = 0;
    life && super.reset(life, easing);
  }

  applyBehaviour(particle, time, index) {
    super.applyBehaviour(particle, time, index);

    this.time += time;
    if (this.time >= this.delayPan.getValue()) {
      var ax = MathUtils.randomAToB(-this.randomFoce.x, this.randomFoce.x);
      var ay = MathUtils.randomAToB(-this.randomFoce.y, this.randomFoce.y);
      var az = MathUtils.randomAToB(-this.randomFoce.z, this.randomFoce.z);

      particle.a.addValue(ax, ay, az);
      this.time = 0;
    }
  }
}
