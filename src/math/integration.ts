import { INTEGRATION_TYPE_EULER } from './constants';
import { DEFAULT_SYSTEM_DELTA } from '../core/constants';

// `particle` is typed loosely until core/Particle is converted to TypeScript
// (spec 06, later Stage 2 pass); it is a `Particle` instance.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Particle = any;

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
