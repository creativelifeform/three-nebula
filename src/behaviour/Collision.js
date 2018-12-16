import Behaviour from './Behaviour';
import { Vector3D } from '../math';

export default class Collision extends Behaviour {
  /**
   * The Scale class is the base for the other Behaviour
   *
   * @class Behaviour
   * @constructor
   */
  //can use Collision(emitter,true,function(){}) or Collision();
  constructor(emitter, useMass, callback, life, easing) {
    super(life, easing);

    this.reset(emitter, useMass, callback);
    this.name = 'Collision';
  }

  reset(emitter, useMass, callback, life, easing) {
    this.emitter = emitter;
    this.useMass = useMass;
    this.callback = callback;
    this.particles = [];
    this.delta = new Vector3D();

    life && super.reset(life, easing);
  }

  applyBehaviour(particle, time, index) {
    var particles = this.emitter
      ? this.emitter.particles.slice(index)
      : this.particles.slice(index);
    var otherParticle, lengthSq, overlap, distance;
    var averageMass1, averageMass2;

    var i = particles.length;

    while (i--) {
      otherParticle = particles[i];
      if (otherParticle == particle) continue;

      this.delta.copy(otherParticle.p).sub(particle.p);
      lengthSq = this.delta.lengthSq();
      distance = particle.radius + otherParticle.radius;

      if (lengthSq <= distance * distance) {
        overlap = distance - Math.sqrt(lengthSq);
        overlap += 0.5;

        averageMass1 = this._getAverageMass(particle, otherParticle);
        averageMass2 = this._getAverageMass(otherParticle, particle);

        particle.p.add(
          this.delta
            .clone()
            .normalize()
            .scalar(overlap * -averageMass1)
        );
        otherParticle.p.add(
          this.delta.normalize().scalar(overlap * averageMass2)
        );

        this.callback && this.callback(particle, otherParticle);
      }
    }
  }

  _getAverageMass(aPartcile, bParticle) {
    return this.useMass
      ? bParticle.mass / (aPartcile.mass + bParticle.mass)
      : 0.5;
  }

  fromJSON(json) { // eslint-disable-line
    // TODO
  }
}
