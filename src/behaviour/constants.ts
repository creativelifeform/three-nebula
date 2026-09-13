import { easeLinear } from '../ease';

export const DEFAULT_LIFE = Infinity;
export const DEFAULT_ATTRACITON_RADIUS = 1000;
export const DEFAULT_ATTRACTION_FORCE_SCALAR = 100;
export const DEFAULT_BEHAVIOUR_EASING = easeLinear;
export const DEFAULT_BEHAVIOUR_EASING_TYPE = 'easeLinear';
export const DEFAULT_RANDOM_DRIFT_DELAY = 0.03;
export const DEFAULT_VORTEX_SWIRL = 400;
export const DEFAULT_VORTEX_PULL = 0;
export const DEFAULT_VORTEX_FALLOFF = 1;
// Below this distance from the swirl axis a particle has no well-defined
// tangent, so the Vortex leaves it untouched (also avoids a 1/dist^falloff blowup).
export const VORTEX_MIN_DISTANCE = 0.0001;
export const PARTICLE_ALPHA_THRESHOLD = 0.002;
export const PARTICLE_LENGTH_SQ_THRESHOLD = 0.000004;
export const DEFAULT_CROSS_TYPE = 'dead';
