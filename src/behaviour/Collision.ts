import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { BEHAVIOUR_TYPE_COLLISION as type } from './types';
import type { EasingFunction } from '../ease';
import type Particle from '../core/Particle';
import type Emitter from '../emitter/Emitter';

type OnCollide = (particle: Particle, otherParticle: Particle) => void;

/**
 * Behaviour that causes particles to move away from other particles they collide with.
 */
export default class Collision extends Behaviour {
  emitter: Emitter;
  useMass: boolean;
  onCollide: OnCollide;
  particles: Particle[];
  delta: Vector3D;

  /**
   * Constructs a Collision behaviour instance.
   *
   * @param emitter - The emitter containing the particles to detect collisions against
   * @param useMass - Determiens whether to use mass or not
   * @param onCollide - Function to call when particles collide
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    emitter: Emitter,
    useMass: boolean,
    onCollide: OnCollide,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(emitter, useMass, onCollide);
  }

  /**
   * Resets the behaviour properties.
   *
   * @param emitter - The emitter containing the particles to detect collisions against
   * @param useMass - Determiens whether to use mass or not
   * @param onCollide - Function to call when particles collide
   * @param life - The life of the particle
   * @param easing - The behaviour's decaying trend
   */
  reset(
    emitter: Emitter,
    useMass: boolean,
    onCollide: OnCollide,
    life?: number,
    easing?: EasingFunction
  ): void {
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
   * @param particle - the particle to apply the behaviour to
   * @param time - particle engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
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
   * @param particleA - The first particle
   * @param particleB - The second particle
   */
  _getAverageMass(particleA: Particle, particleB: Particle): number {
    return this.useMass
      ? particleB.mass / (particleA.mass + particleB.mass)
      : 0.5;
  }

  // TODO
  fromJSON(json: Record<string, unknown>): void {} // eslint-disable-line
}
