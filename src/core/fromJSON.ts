import * as Behaviour from '../behaviour';
import * as Initializer from '../initializer';

import { EULER, POOL_MAX } from '../constants';
import { DEFAULT_DAMPING } from '../emitter/constants';
import {
  INITIALIZER_TYPES_THAT_REQUIRE_THREE,
  SUPPORTED_JSON_BEHAVIOUR_TYPES,
  SUPPORTED_JSON_INITIALIZER_TYPES,
  isSupported,
} from './constants';
import type {
  SupportedBehaviourType,
  SupportedInitializerType,
} from './constants';

import Rate from '../initializer/Rate';
import type System from './System';
import type Emitter from '../emitter/Emitter';
import type { InheritConfig, OrphanPolicy } from '../emitter/Emitter';
import type InitializerBase from '../initializer/Initializer';
import type BehaviourBase from '../behaviour/Behaviour';

type ThreeApi = typeof import('three');

// A factory is any namespace member exposing a static `fromJSON`. The `never[]`
// params make each concrete (narrowly-typed) `fromJSON` assignable while still
// checking the RETURN type — so `satisfies Record<Union, …>` verifies, at
// compile time, that every supported type maps to a real namespace member of
// the right kind. A constant-list/namespace mismatch is now a build error
// rather than a runtime throw (which is exactly what MOD-3 buys us).
type InitializerFactory = { fromJSON(...args: never[]): InitializerBase };
type BehaviourFactory = { fromJSON(...args: never[]): BehaviourBase };

const INITIALIZERS = {
  Position: Initializer.Position,
  Rotation: Initializer.Rotation,
  Life: Initializer.Life,
  Radius: Initializer.Radius,
  Mass: Initializer.Mass,
  Body: Initializer.Body,
  BodySprite: Initializer.BodySprite,
  Texture: Initializer.Texture,
  PolarVelocity: Initializer.PolarVelocity,
  RadialVelocity: Initializer.RadialVelocity,
  VectorVelocity: Initializer.VectorVelocity,
} satisfies Record<SupportedInitializerType, InitializerFactory>;

const BEHAVIOURS = {
  Alpha: Behaviour.Alpha,
  Attraction: Behaviour.Attraction,
  Color: Behaviour.Color,
  CrossZone: Behaviour.CrossZone,
  Force: Behaviour.Force,
  Gravity: Behaviour.Gravity,
  RandomDrift: Behaviour.RandomDrift,
  Repulsion: Behaviour.Repulsion,
  Rotate: Behaviour.Rotate,
  Scale: Behaviour.Scale,
  Spring: Behaviour.Spring,
} satisfies Record<SupportedBehaviourType, BehaviourFactory>;

// The concrete `fromJSON` methods each take a narrow `*JSON` param; the JSON we
// deserialise is the hostile `Record<string, unknown>`. These two helpers do
// that single narrowing at the call boundary (identical to the base JS, which
// fed the raw object straight in) so the loops below stay cast-free.
export const makeInitializer = (
  type: SupportedInitializerType,
  properties: Record<string, unknown>,
  THREE?: ThreeApi
): InitializerBase =>
  (
    INITIALIZERS[type].fromJSON as (
      properties: Record<string, unknown>,
      THREE?: ThreeApi
    ) => InitializerBase
  )(properties, THREE);

export const makeBehaviour = (
  type: SupportedBehaviourType,
  properties: Record<string, unknown>
): BehaviourBase =>
  (
    BEHAVIOURS[type].fromJSON as (
      properties: Record<string, unknown>
    ) => BehaviourBase
  )(properties);

/** A `{ type, properties }` entry in the JSON. */
export interface ItemJSON {
  type: SupportedInitializerType | SupportedBehaviourType | (string & {});
  properties: Record<string, unknown>;
}

export interface EmitterJSON {
  rate: Record<string, unknown>;
  rotation?: Record<string, number>;
  initializers: ItemJSON[];
  behaviours: ItemJSON[];
  emitterBehaviours?: ItemJSON[];
  position?: Record<string, number>;
  totalEmitTimes?: number;
  life?: number;
  damping?: number;
  // Emitter hierarchy (spec 01, Stage 2), all additive: `children` nests emitter
  // templates (absent = a flat leaf emitter, i.e. today's schema); `inherit` and
  // `orphanPolicy` only apply to a nested child.
  children?: EmitterJSON[];
  inherit?: Partial<InheritConfig>;
  orphanPolicy?: OrphanPolicy;
}

export interface SystemJSON {
  preParticles?: number;
  integrationType?: string;
  emitters?: EmitterJSON[];
}

// Constructors are passed in (rather than imported) to avoid a circular
// dependency with System.
export type SystemConstructor = new (
  preParticles?: number,
  integrationType?: string
) => System;
export type EmitterConstructor = new (
  properties?: Record<string, unknown>
) => Emitter;

/**
 * Makes a rate instance.
 */
const makeRate = (json: Record<string, unknown>): Rate =>
  Rate.fromJSON(json as Parameters<typeof Rate.fromJSON>[0]);

/**
 * Makes initializers from json items.
 */
const makeInitializers = (
  items: ItemJSON[],
  THREE: ThreeApi
): InitializerBase[] => {
  const initializers: InitializerBase[] = [];

  items.forEach(data => {
    const { type, properties } = data;

    if (!isSupported(SUPPORTED_JSON_INITIALIZER_TYPES, type)) {
      throw new Error(
        `The initializer type ${type} is invalid or not yet supported`
      );
    }

    if (INITIALIZER_TYPES_THAT_REQUIRE_THREE.includes(type)) {
      initializers.push(makeInitializer(type, properties, THREE));
    } else {
      initializers.push(makeInitializer(type, properties));
    }
  });

  return initializers;
};

/**
 * Makes behaviours from json items.
 */
const makeBehaviours = (items: ItemJSON[]): BehaviourBase[] => {
  const behaviours: BehaviourBase[] = [];

  items.forEach(data => {
    const { type, properties } = data;

    if (!isSupported(SUPPORTED_JSON_BEHAVIOUR_TYPES, type)) {
      throw new Error(
        `The behaviour type ${type} is invalid or not yet supported`
      );
    }

    behaviours.push(makeBehaviour(type, properties));
  });

  return behaviours;
};

/**
 * Builds an emitter (and, recursively, its child templates) from JSON. Children
 * are wired as `childNodes` rather than added to the System — only the root is
 * added, which assigns the whole subtree's node ids and enforces the depth cap.
 */
const buildEmitter = (
  data: EmitterJSON,
  THREE: ThreeApi,
  Emitter: EmitterConstructor
): Emitter => {
  const emitter = new Emitter();
  const {
    rate,
    rotation,
    initializers,
    behaviours,
    emitterBehaviours = [],
    position,
    totalEmitTimes = Infinity,
    life = Infinity,
    damping = DEFAULT_DAMPING,
    children = [],
    inherit,
    orphanPolicy,
  } = data;

  emitter.damping = damping;
  emitter
    .setRate(makeRate(rate))
    .setRotation(rotation)
    .setInitializers(makeInitializers(initializers, THREE))
    .setBehaviours(makeBehaviours(behaviours))
    .setEmitterBehaviours(makeBehaviours(emitterBehaviours))
    .setPosition(position)
    .emit(totalEmitTimes, life);

  if (inherit) {
    emitter.inherit = { ...emitter.inherit, ...inherit };
  }

  if (orphanPolicy) {
    emitter.orphanPolicy = orphanPolicy;
  }

  children.forEach(child =>
    emitter.addChild(buildEmitter(child, THREE, Emitter))
  );

  return emitter;
};

/**
 * Creates a System instance from a JSON object.
 *
 * @deprecated Use fromJSONAsync instead.
 */
export default (
  json: SystemJSON,
  THREE: ThreeApi,
  System: SystemConstructor,
  Emitter: EmitterConstructor
): System => {
  const {
    preParticles = POOL_MAX,
    integrationType = EULER,
    emitters = [],
  } = json;
  // The async path (fromJSONAsync) already calls this correctly; the deprecated
  // sync path historically passed THREE into the preParticles slot — a bug that
  // set system.preParticles to the three namespace. Fixed to match the async path.
  const system = new System(preParticles, integrationType);

  emitters.forEach(data =>
    system.addEmitter(buildEmitter(data, THREE, Emitter))
  );

  return system;
};
