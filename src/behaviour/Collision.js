import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { BEHAVIOUR_TYPE_COLLISION as type } from './types';

/**
 * Behaviour that causes particles to move away from other particles they collide with.
 */
export default class Collision extends Behaviour {
  /**
   * Constructs a Collision behaviour instance.
   *
   * @param {Emitter} emitter - The emitter containing the particles to detect collisions against
   * @param {boolean} useMass - Determiens whether to use mass or not
   * @param {function} onCollide - Function to call when particles collide
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   * @param {boolean} [isEnabled=true] - Determines if the behaviour will be applied or not
   * @return void
   */
  constructor(emitter, useMass, onCollide, life, easing, isEnabled = true) {
    super(life, easing, type, isEnabled);

    this.reset(emitter, useMass, onCollide);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param {Emitter} emitter - The emitter containing the particles to detect collisions against
   * @param {boolean} useMass - Determiens whether to use mass or not
   * @param {function} onCollide - Function to call when particles collide
   * @param {number} life - The life of the particle
   * @param {function} easing - The behaviour's decaying trend
   * @return void
   */
  reset(emitter, useMass, onCollide, life, easing) {
    this.emitter = emitter;
    this.useMass = useMass;
    this.onCollide = onCollide;
    this.particles = [];
    this.delta = new Vector3D();

    life && super.reset(life, easing);
  }

  /**
   * Detects collisions with other particles and calls the
   * onCollide function on colliding particles.
   *
   * @param {Particle} particle - the particle to apply the behaviour to
   * @param {number} time - particle engine time
   * @param {integer} index - the particle index
   * @return void
   */
  applyBehaviour(particle, time, index) {
    const particles = this.emitter
      ? this.emitter.particles.slice(index)
      : this.particles.slice(index);
    let otherParticle, lengthSq, overlap, distance, averageMass1, averageMass2;
    let i = particles.length;

    while (i--) {
      otherParticle = particles[i];

      if (otherParticle == particle) {
        continue;
      }

      this.delta.copy(otherParticle.position).sub(particle.position);

      lengthSq = this.delta.lengthSq();
      distance = particle.radius + otherParticle.radius;

      if (lengthSq <= distance * distance) {
        overlap = distance - Math.sqrt(lengthSq);
        overlap += 0.5;

        averageMass1 = this._getAverageMass(particle, otherParticle);
        averageMass2 = this._getAverageMass(otherParticle, particle);

        particle.position.add(
          this.delta
            .clone()
            .normalize()
            .scalar(overlap * -averageMass1)
        );

        otherParticle.position.add(
          this.delta.normalize().scalar(overlap * averageMass2)
        );

        this.onCollide && this.onCollide(particle, otherParticle);
      }
    }
  }

  /**
   * Gets the average mass of both particles.
   *
   * @param {Particle} particleA - The first particle
   * @param {Particle} particleB - The second particle
   * @return {number}
   */
  _getAverageMass(particleA, particleB) {
    return this.useMass
      ? particleB.mass / (particleA.mass + particleB.mass)
      : 0.5;
  }

  // TODO
  fromJSON(json) {} // eslint-disable-line
}
