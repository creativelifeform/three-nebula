import { INTEGRATION_TYPE_EULER } from './constants';

/**
 * Performs euler integration on the particle.
 *
 * @param {Particle} particle - The particle to integrate
 * @param {number} time - The factor of time to use
 * @param {number} damping - The damping to use
 * @return void
 */
const eulerIntegration = (particle, time, damping) => {
  if (particle.sleep) {
    return;
  }

  particle.old.p.copy(particle.p);
  particle.old.v.copy(particle.v);
  particle.a.scalar(1 / particle.mass);
  particle.v.add(particle.a.scalar(time));
  particle.p.add(particle.old.v.scalar(time));
  damping && particle.v.scalar(damping);
  particle.a.clear();
};

/**
 * Performs the chosen integration on the particle.
 * Defaults to euler integration.
 *
 * @param {Particle} particle - The particle to integrate
 * @param {number} time - The factor of time to use
 * @param {number} damping - The damping to use
 * @param {string} [type=INTEGRATION_TYPE_EULER] - The algorithm to use
 * @return void
 */
export const integrate = (
  particle,
  time,
  damping,
  type = INTEGRATION_TYPE_EULER
) => {
  switch (type) {
    case INTEGRATION_TYPE_EULER:
      eulerIntegration(particle, time, damping);
      break;
    default:
      eulerIntegration(particle, time, damping);
  }
};
