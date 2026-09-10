import { EULER, POOL_MAX } from '../constants';
import { DEFAULT_DAMPING } from '../emitter/constants';
import {
  INITIALIZER_TYPES_THAT_REQUIRE_THREE,
  SUPPORTED_JSON_BEHAVIOUR_TYPES,
  SUPPORTED_JSON_INITIALIZER_TYPES,
  isSupported,
} from './constants';

import Rate from '../initializer/Rate';
import TextureInitializer from '../initializer/Texture';
import { makeBehaviour, makeInitializer } from './fromJSON';
import type System from './System';
import type Emitter from '../emitter/Emitter';
import type InitializerBase from '../initializer/Initializer';
import type BehaviourBase from '../behaviour/Behaviour';
import type {
  EmitterJSON,
  ItemJSON,
  SystemJSON,
  SystemConstructor,
  EmitterConstructor,
} from './fromJSON';

type ThreeApi = typeof import('three');

interface FromJSONAsyncOptions {
  shouldAutoEmit?: boolean;
}

const DEFAULT_OPTIONS: FromJSONAsyncOptions = { shouldAutoEmit: true };

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
): Promise<InitializerBase[]> =>
  new Promise((resolve, reject) => {
    if (!items.length) {
      return resolve([]);
    }

    const numberOfInitializers = items.length;
    // Each result is written at its ORIGINAL index, and we resolve once every slot is
    // filled — so the resolved array preserves the input order regardless of how the
    // async texture loads below interleave. (Previously initializers were pushed as
    // they completed: non-texture ones first, then texture ones in load-resolution
    // order, which reordered them non-deterministically.)
    const madeInitializers: InitializerBase[] = new Array(numberOfInitializers);
    let madeCount = 0;

    const onMade = (index: number, initializer: InitializerBase) => {
      madeInitializers[index] = initializer;
      madeCount += 1;

      if (madeCount === numberOfInitializers) {
        return resolve(madeInitializers);
      }
    };

    items.forEach((data, index) => {
      const { type, properties } = data;

      if (!isSupported(SUPPORTED_JSON_INITIALIZER_TYPES, type)) {
        return reject(
          `The initializer type ${type} is invalid or not yet supported`
        );
      }

      if (properties.texture) {
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(
          properties.texture as string,
          loadedTexture =>
            onMade(
              index,
              TextureInitializer.fromJSON(
                { ...properties, loadedTexture } as Parameters<
                  typeof TextureInitializer.fromJSON
                >[0],
                THREE
              )
            ),
          undefined,
          reject
        );

        return;
      }

      onMade(
        index,
        INITIALIZER_TYPES_THAT_REQUIRE_THREE.includes(type)
          ? makeInitializer(type, properties, THREE)
          : makeInitializer(type, properties)
      );
    });
  });

/**
 * Makes behaviours from json items.
 */
const makeBehaviours = (items: ItemJSON[]): Promise<BehaviourBase[]> =>
  new Promise((resolve, reject) => {
    if (!items.length) {
      return resolve([]);
    }

    const numberOfBehaviours = items.length;
    const madeBehaviours: BehaviourBase[] = [];

    items.forEach(data => {
      const { type, properties } = data;

      if (!isSupported(SUPPORTED_JSON_BEHAVIOUR_TYPES, type)) {
        return reject(
          `The behaviour type ${type} is invalid or not yet supported`
        );
      }

      madeBehaviours.push(makeBehaviour(type, properties));

      if (madeBehaviours.length === numberOfBehaviours) {
        return resolve(madeBehaviours);
      }
    });
  });

/**
 * Builds one emitter (and, recursively, its child templates) from JSON, awaiting
 * each node's async initializer/texture loads. Children are wired as `childNodes`
 * via addChild; only the root is added to the System (which assigns node ids and
 * enforces the depth cap). Mirrors the sync `buildEmitter`.
 */
const buildEmitterAsync = (
  data: EmitterJSON,
  Emitter: EmitterConstructor,
  THREE: ThreeApi,
  shouldAutoEmit: boolean | undefined
): Promise<Emitter> => {
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
  emitter.setRate(makeRate(rate)).setRotation(rotation).setPosition(position);

  if (inherit) {
    emitter.inherit = { ...emitter.inherit, ...inherit };
  }

  if (orphanPolicy) {
    emitter.orphanPolicy = orphanPolicy;
  }

  return makeInitializers(initializers, THREE)
    .then(madeInitializers => {
      emitter.setInitializers(madeInitializers);

      return makeBehaviours(behaviours);
    })
    .then(madeBehaviours => {
      emitter.setBehaviours(madeBehaviours);

      return makeBehaviours(emitterBehaviours);
    })
    .then(madeEmitterBehaviours => {
      emitter.setEmitterBehaviours(madeEmitterBehaviours);

      // Build children in order (each may itself load textures asynchronously).
      return Promise.all(
        children.map(child =>
          buildEmitterAsync(child, Emitter, THREE, shouldAutoEmit)
        )
      );
    })
    .then(childEmitters => {
      childEmitters.forEach(child => emitter.addChild(child));

      return shouldAutoEmit
        ? emitter.emit(totalEmitTimes, life)
        : emitter.setTotalEmitTimes(totalEmitTimes).setLife(life);
    });
};

const makeEmitters = (
  emitters: EmitterJSON[],
  Emitter: EmitterConstructor,
  THREE: ThreeApi,
  shouldAutoEmit: boolean | undefined
): Promise<Emitter[]> =>
  // Promise.all preserves input order, so system.emitters stays in JSON order
  // regardless of how the nested async texture loads interleave.
  Promise.all(
    emitters.map(data =>
      buildEmitterAsync(data, Emitter, THREE, shouldAutoEmit)
    )
  );

/**
 * Creates a System instance from a JSON object.
 */
export default (
  json: SystemJSON,
  THREE: ThreeApi,
  System: SystemConstructor,
  Emitter: EmitterConstructor,
  options: FromJSONAsyncOptions = {}
): Promise<System> =>
  new Promise((resolve, reject) => {
    const {
      preParticles = POOL_MAX,
      integrationType = EULER,
      emitters = [],
    } = json;
    const system = new System(preParticles, integrationType);
    const { shouldAutoEmit } = { ...DEFAULT_OPTIONS, ...options };

    makeEmitters(emitters, Emitter, THREE, shouldAutoEmit)
      .then(madeEmitters => {
        const numberOfEmitters = madeEmitters.length;

        if (!numberOfEmitters) {
          return resolve(system);
        }

        madeEmitters.forEach(madeEmitter => {
          system.addEmitter(madeEmitter);

          if (system.emitters.length === numberOfEmitters) {
            resolve(system);
          }
        });
      })
      .catch(reject);
  });
