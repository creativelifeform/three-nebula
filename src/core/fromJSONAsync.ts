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
type ThreeTexture = import('three').Texture;

/**
 * A content-addressed asset reference (spec 05). The `hash` is the asset's
 * identity (sha256 over the raw bytes, algorithm-prefixed); `mime` is its type.
 */
export interface AssetRef {
  hash: string;
  mime: string;
}

/**
 * Resolves a content-addressed asset reference to a URL the loader can fetch.
 * Supplied by the consumer (an HTTP/CDN resolver, a `Map` for tests, …); the
 * library ships none and is storage-agnostic. Only invoked on the `textureRef`
 * path — a fully-inline (base64 `texture`) system needs no resolver.
 */
export type AssetResolver = (ref: AssetRef) => Promise<string>;

export interface FromJSONAsyncOptions {
  shouldAutoEmit?: boolean;
  resolveAsset?: AssetResolver;
}

const DEFAULT_OPTIONS: FromJSONAsyncOptions = { shouldAutoEmit: true };

// Threaded through the async build: the optional resolver + a per-build decode
// cache keyed by asset hash, so repeated refs resolve/load exactly once.
interface AssetContext {
  resolveAsset?: AssetResolver;
  cache: Map<string, Promise<ThreeTexture>>;
}

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
  THREE: ThreeApi,
  assets: AssetContext
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

      // Both texture forms resolve to a loaded THREE.Texture, then build the same
      // Texture initializer. `textureRef` (content-addressed) takes precedence over
      // inline `texture` if both are somehow present (spec 05).
      const buildTextureInitializer = (loadedTexture: ThreeTexture) =>
        onMade(
          index,
          TextureInitializer.fromJSON(
            { ...properties, loadedTexture } as Parameters<
              typeof TextureInitializer.fromJSON
            >[0],
            THREE
          )
        );

      const loadUrl = (url: string): Promise<ThreeTexture> =>
        new Promise((resolveTexture, rejectTexture) =>
          new THREE.TextureLoader().load(
            url,
            resolveTexture,
            undefined,
            rejectTexture
          )
        );

      if (properties.textureRef) {
        const ref = properties.textureRef as AssetRef;

        if (!assets.resolveAsset) {
          return reject(
            `A textureRef was found (hash: ${ref.hash}) but no resolveAsset option was supplied to fromJSONAsync`
          );
        }

        // Dedup by hash: the same asset referenced many times resolves/loads once.
        let loaded = assets.cache.get(ref.hash);

        if (!loaded) {
          loaded = assets.resolveAsset(ref).then(loadUrl);
          assets.cache.set(ref.hash, loaded);
        }

        loaded.then(buildTextureInitializer).catch(reject);

        return;
      }

      if (properties.texture) {
        loadUrl(properties.texture as string)
          .then(buildTextureInitializer)
          .catch(reject);

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
  shouldAutoEmit: boolean | undefined,
  assets: AssetContext
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
    trigger,
  } = data;

  emitter.damping = damping;
  emitter.setRate(makeRate(rate)).setRotation(rotation).setPosition(position);

  if (inherit) {
    emitter.inherit = { ...emitter.inherit, ...inherit };
  }

  if (orphanPolicy) {
    emitter.orphanPolicy = orphanPolicy;
  }

  if (trigger) {
    emitter.trigger = trigger;
  }

  return makeInitializers(initializers, THREE, assets)
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
          buildEmitterAsync(child, Emitter, THREE, shouldAutoEmit, assets)
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
  shouldAutoEmit: boolean | undefined,
  assets: AssetContext
): Promise<Emitter[]> =>
  // Promise.all preserves input order, so system.emitters stays in JSON order
  // regardless of how the nested async texture loads interleave.
  Promise.all(
    emitters.map(data =>
      buildEmitterAsync(data, Emitter, THREE, shouldAutoEmit, assets)
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
    const { shouldAutoEmit, resolveAsset } = { ...DEFAULT_OPTIONS, ...options };
    // One decode cache per build so repeated asset refs load once (dedup).
    const assets: AssetContext = { resolveAsset, cache: new Map() };

    makeEmitters(emitters, Emitter, THREE, shouldAutoEmit, assets)
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
