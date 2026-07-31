import * as Behaviour from '../behaviour';
import * as Initializer from '../initializer';

import { EULER, POOL_MAX } from '../constants';
import { DEFAULT_DAMPING } from '../emitter/constants';
import {
  INITIALIZER_TYPES_THAT_REQUIRE_THREE,
  SUPPORTED_JSON_BEHAVIOUR_TYPES,
  SUPPORTED_JSON_INITIALIZER_TYPES,
} from './constants';

import Rate from '../initializer/Rate';
import type System from './System';
import type Emitter from '../emitter/Emitter';
import type InitializerBase from '../initializer/Initializer';
import type BehaviourBase from '../behaviour/Behaviour';

type ThreeApi = typeof import('three');

/** A `{ type, properties }` entry in the JSON. */
export interface ItemJSON {
  type: string;
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

// The Initializer / Behaviour namespaces indexed by the JSON `type` string.
const initializerFor = (type: string) =>
  (
    Initializer as unknown as Record<
      string,
      {
        fromJSON(
          properties: Record<string, unknown>,
          THREE?: ThreeApi
        ): InitializerBase;
      }
    >
  )[type];

const behaviourFor = (type: string) =>
  (
    Behaviour as unknown as Record<
      string,
      { fromJSON(properties: Record<string, unknown>): BehaviourBase }
    >
  )[type];

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

    if (!SUPPORTED_JSON_INITIALIZER_TYPES.includes(type)) {
      throw new Error(
        `The initializer type ${type} is invalid or not yet supported`
      );
    }

    if (INITIALIZER_TYPES_THAT_REQUIRE_THREE.includes(type)) {
      initializers.push(initializerFor(type).fromJSON(properties, THREE));
    } else {
      initializers.push(initializerFor(type).fromJSON(properties));
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

    if (!SUPPORTED_JSON_BEHAVIOUR_TYPES.includes(type)) {
      throw new Error(
        `The behaviour type ${type} is invalid or not yet supported`
      );
    }

    behaviours.push(behaviourFor(type).fromJSON(properties));
  });

  return behaviours;
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

  emitters.forEach(data => {
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

    system.addEmitter(emitter);
  });

  return system;
};
