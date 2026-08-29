import { Rate } from '../initializer';

export const DEFAULT_DAMPING = 0.006;
export const DEFAULT_BIND_EMITTER = true;
export const DEFAULT_EMITTER_RATE = new Rate(1, 0.1);
export const DEFAULT_BIND_EMITTER_EVENT = false;
export const DEFAULT_EMITTER_INDEX = undefined;

// Emitter hierarchy (spec 01, Stage 2). A child emitter's transform tracks its
// parent particle per channel: position follows by default (trails/attached FX),
// rotation and scale are left in system space unless asked for.
export const DEFAULT_INHERIT_POSITION = 'always';
export const DEFAULT_INHERIT_ROTATION = 'none';
export const DEFAULT_INHERIT_SCALE = 'none';

// What happens to a child instance's already-emitted particles when its parent
// particle dies. `detach` lets them live out their lives (a spark's smoke should
// outlive the spark); `kill` takes them with it.
export const DEFAULT_ORPHAN_POLICY = 'detach';
