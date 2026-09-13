import {
  BEHAVIOUR_TYPE_ALPHA,
  BEHAVIOUR_TYPE_ATTRACTION,
  BEHAVIOUR_TYPE_COLOR,
  BEHAVIOUR_TYPE_CROSS_ZONE,
  BEHAVIOUR_TYPE_FORCE,
  BEHAVIOUR_TYPE_GRAVITY,
  BEHAVIOUR_TYPE_RANDOM_DRIFT,
  BEHAVIOUR_TYPE_REPULSION,
  BEHAVIOUR_TYPE_ROTATE,
  BEHAVIOUR_TYPE_SCALE,
  BEHAVIOUR_TYPE_SPRING,
  BEHAVIOUR_TYPE_VORTEX,
} from '../behaviour/types';
import {
  INITIALIZER_TYPE_BODY,
  INITIALIZER_TYPE_BODY_SPRITE,
  INITIALIZER_TYPE_LIFE,
  INITIALIZER_TYPE_MASS,
  INITIALIZER_TYPE_POLAR_VELOCITY,
  INITIALIZER_TYPE_POSITION,
  INITIALIZER_TYPE_ROTATION,
  INITIALIZER_TYPE_RADIAL_VELOCITY,
  INITIALIZER_TYPE_RADIUS,
  INITIALIZER_TYPE_TEXTURE,
  INITIALIZER_TYPE_VECTOR_VELOCITY,
} from '../initializer/types';
import {
  ZONE_TYPE_BOX,
  ZONE_TYPE_LINE,
  ZONE_TYPE_MESH,
  ZONE_TYPE_POINT,
  ZONE_TYPE_SPHERE,
} from '../zone/types';

import { RENDERER_TYPE_SPRITE } from '../renderer/types';
import { easeLinear } from '../ease';

/**
 * @desc Default particle life
 * @type {number}
 */
export const DEFAULT_LIFE = Infinity;
/**
 * @desc Default particle age
 * @type {number}
 */
export const DEFAULT_AGE = 0;
/**
 * @desc Default particle energy
 * @type {number}
 */
export const DEFAULT_ENERGY = 1;
/**
 * @desc Default particle dead
 * @type {boolean}
 */
export const DEFAULT_DEAD = false;
/**
 * @desc Default particle sleep
 * @type {boolean}
 */
export const DEFAULT_SLEEP = false;

/**
 * @desc Default particle index
 * @type {number}
 */
export const DEFAULT_INDEX = 0;
/**
 * @desc Default particle body
 * @type {?object}
 */
export const DEFAULT_BODY = null;
/**
 * @desc Default particle parent
 * @type {?Emitter}
 */
export const DEFAULT_PARENT = null;
/**
 * @desc Default particle mass
 * @type {number}
 */
export const DEFAULT_MASS = 1;
/**
 * @desc Default particle radius
 * @type {number}
 */
export const DEFAULT_RADIUS = 10;
/**
 * @desc Default particle alpha
 * @type {number}
 */
export const DEFAULT_ALPHA = 1;
/**
 * @desc Default particle scale
 * @type {number}
 */
export const DEFAULT_SCALE = 1;
/**
 * @desc Default particle useColor
 * @type {boolean}
 */
export const DEFAULT_USE_COLOR = false;
/**
 * @desc Default particle useAlpha
 * @type {boolean}
 */
export const DEFAULT_USE_ALPHA = false;
/**
 * @desc Default particle easing
 * @type {function}
 */
export const DEFAULT_EASING = easeLinear;

/**
 * @desc The default delta provided to the System instance
 * @type {number}
 */
export const DEFAULT_SYSTEM_DELTA = 0.0167;

/**
 * The default maximum number of fixed sub-steps consumed per `System.tick` call.
 * Caps catch-up after a long stall (e.g. a backgrounded tab) so the accumulator
 * can't spiral; excess real time beyond this is dropped.
 *
 * @type {number}
 */
export const DEFAULT_MAX_SUB_STEPS = 6;

/**
 * The default global cap on concurrently live child emitter instances (spec 01,
 * Stage 1). Nested emitters multiply cardinality fast (100 parents × a child
 * node = 100 live instances), so this bounds the blast radius. On overflow the
 * newest instance is dropped — the right default for FX. Raise via
 * `System.maxEmitterInstances` for genuinely large hierarchies.
 *
 * @type {number}
 */
export const DEFAULT_MAX_EMITTER_INSTANCES = 2000;

/**
 * The default hard recursion limit on the emitter tree (spec 01, Stage 2). A
 * self-triggering or accidentally deep hierarchy retains every ancestor instance
 * until its last descendant dies, so an unbounded chain leaks until it exhausts
 * memory. Trees deeper than this are rejected when added to a System.
 *
 * @type {number}
 */
export const DEFAULT_MAX_DEPTH = 4;

/**
 * @desc The types of initializers supported by the System.fromJSON method.
 * @type {array<string>}
 */
export const SUPPORTED_JSON_INITIALIZER_TYPES = [
  INITIALIZER_TYPE_POSITION,
  INITIALIZER_TYPE_ROTATION,
  INITIALIZER_TYPE_LIFE,
  INITIALIZER_TYPE_RADIUS,
  INITIALIZER_TYPE_MASS,
  INITIALIZER_TYPE_BODY,
  INITIALIZER_TYPE_BODY_SPRITE,
  INITIALIZER_TYPE_TEXTURE,
  INITIALIZER_TYPE_POLAR_VELOCITY,
  INITIALIZER_TYPE_RADIAL_VELOCITY,
  INITIALIZER_TYPE_VECTOR_VELOCITY,
] as const;

/** The initializer `type` strings accepted by `System.fromJSON`. */
export type SupportedInitializerType =
  (typeof SUPPORTED_JSON_INITIALIZER_TYPES)[number];

/**
 * @desc The types of behaviours supported by the System.fromJSON method.
 * @type {array<string>}
 */
export const SUPPORTED_JSON_BEHAVIOUR_TYPES = [
  BEHAVIOUR_TYPE_ALPHA,
  BEHAVIOUR_TYPE_ATTRACTION,
  BEHAVIOUR_TYPE_COLOR,
  BEHAVIOUR_TYPE_CROSS_ZONE,
  BEHAVIOUR_TYPE_FORCE,
  BEHAVIOUR_TYPE_GRAVITY,
  BEHAVIOUR_TYPE_RANDOM_DRIFT,
  BEHAVIOUR_TYPE_REPULSION,
  BEHAVIOUR_TYPE_ROTATE,
  BEHAVIOUR_TYPE_SCALE,
  BEHAVIOUR_TYPE_SPRING,
  BEHAVIOUR_TYPE_VORTEX,
] as const;

/** The behaviour `type` strings accepted by `System.fromJSON`. */
export type SupportedBehaviourType =
  (typeof SUPPORTED_JSON_BEHAVIOUR_TYPES)[number];

/**
 * @desc The types of renderers supported by the System.fromJSON method.
 * @type {array<string>}
 */
export const SUPPORTED_JSON_RENDERER_TYPES = [RENDERER_TYPE_SPRITE] as const;

/** The renderer `type` strings accepted by `System.fromJSON`. */
export type SupportedRendererType =
  (typeof SUPPORTED_JSON_RENDERER_TYPES)[number];

/**
 * @desc The types of zones supported by the System.fromJSON method.
 * @type {array<string>}
 */
export const SUPPORTED_JSON_ZONE_TYPES = [
  ZONE_TYPE_BOX,
  ZONE_TYPE_LINE,
  ZONE_TYPE_MESH,
  ZONE_TYPE_POINT,
  ZONE_TYPE_SPHERE,
] as const;

/** The zone `type` strings accepted by `System.fromJSON`. */
export type SupportedZoneType = (typeof SUPPORTED_JSON_ZONE_TYPES)[number];

/**
 * Narrows an arbitrary JSON `type` string to one of a closed supported-type
 * list. Used so the namespace lookup tables (keyed by the union) accept the
 * string only after the same `.includes()` runtime check the base JS ran.
 */
export const isSupported = <T extends string>(
  supported: readonly T[],
  type: string
): type is T => (supported as readonly string[]).includes(type);

export { INITIALIZER_TYPES_THAT_REQUIRE_THREE } from '../initializer/types';
