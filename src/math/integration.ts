import { INTEGRATION_TYPE_EULER } from './constants';
import { DEFAULT_SYSTEM_DELTA } from '../core/constants';
import type Particle from '../core/Particle';

/**
 * Performs euler integration on the particle.
 */
const eulerIntegration = (
  particle: Particle,
  time: number,
  damping: number
): void => {
  if (particle.sleep) {
    return;
  }

  particle.old.position.copy(particle.position);
  particle.old.velocity.copy(particle.velocity);
  particle.acceleration.scalar(1 / particle.mass);
  particle.velocity.add(particle.acceleration.scalar(time));
  particle.position.add(particle.old.velocity.scalar(time));
  damping &&
    particle.velocity.scalar(Math.pow(damping, time / DEFAULT_SYSTEM_DELTA));
  particle.acceleration.clear();
};

/**
 * Performs the chosen integration on the particle. Defaults to euler.
 */
export const integrate = (
  particle: Particle,
  time: number,
  damping: number,
  type: string = INTEGRATION_TYPE_EULER
): void => {
  switch (type) {
    case INTEGRATION_TYPE_EULER:
      eulerIntegration(particle, time, damping);
      break;
    default:
      eulerIntegration(particle, time, damping);
  }
};
