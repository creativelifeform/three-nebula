import Behaviour from './Behaviour';
import { Util } from '../utils';
import { Vector3D } from '../math';

export default class Attraction extends Behaviour {
  constructor(targetPosition, force, radius, life, easing) {
    super(life, easing);

    this.targetPosition = Util.initValue(targetPosition, new Vector3D());
    this.radius = Util.initValue(radius, 1000);
    this.force = Util.initValue(this.normalizeValue(force), 100);
    this.radiusSq = this.radius * this.radius;
    this.attractionForce = new Vector3D();
    this.lengthSq = 0;
    this.name = 'Attraction';
  }

  reset(targetPosition, force, radius, life, easing) {
    this.targetPosition = Util.initValue(targetPosition, new Vector3D());
    this.radius = Util.initValue(radius, 1000);
    this.force = Util.initValue(this.normalizeValue(force), 100);
    this.radiusSq = this.radius * this.radius;
    this.attractionForce = new Vector3D();
    this.lengthSq = 0;

    if (life) Attraction._super_.prototype.reset.call(this, life, easing);
  }

  applyBehaviour(particle, time, index) {
    Attraction._super_.prototype.applyBehaviour.call(
      this,
      particle,
      time,
      index
    );
    this.attractionForce.copy(this.targetPosition);
    this.attractionForce.sub(particle.p);
    this.lengthSq = this.attractionForce.lengthSq();

    if (this.lengthSq > 0.000004 && this.lengthSq < this.radiusSq) {
      this.attractionForce.normalize();
      this.attractionForce.scalar(1 - this.lengthSq / this.radiusSq);
      this.attractionForce.scalar(this.force);
      particle.a.add(this.attractionForce);
    }
  }
}
