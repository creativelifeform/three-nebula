export const PI = 3.142;

/**
 * The max particle number in pool.
 *
 * @const {integer}
 */
export const POOL_MAX = 500;
export const TIME_STEP = 60;
export const DR = PI / 180;

/**
 * 1:100
 *
 * @const {integer}
 */
export const MEASURE = 100;
export const EULER = 'euler';
export const RK2 = 'runge-kutta2';
export const RK4 = 'runge-kutta4';
export const VERLET = 'verlet';
export const BIND_EMITTER_EVENT = false;

export const __DEV__ = () => {
  // `typeof` guards the bare `process` reference — in a browser `process` is
  // undeclared, so `!process` would throw a ReferenceError rather than be false.
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }

  return process.env.NODE_ENV === 'development';
};
