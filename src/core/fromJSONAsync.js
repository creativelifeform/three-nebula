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
import TextureInitializer from '../initializer/Texture';

const DEFAULT_OPTIONS = { shouldAutoEmit: true };

/**
 * Makes a rate instance.
 *
 * @param {object} json - The data required to construct a Rate instance
 * @return {Rate}
 */
const makeRate = json => Rate.fromJSON(json);

/**
 * Makes initializers from json items.
 *
 * @param {array<object>} items - An array of objects which provide initializer constructor params
 * @param {object} THREE - The Web GL Api to use
 * @return {array<Initializer>}
 */
const makeInitializers = (items, THREE) =>
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
    const madeInitializers = new Array(numberOfInitializers);
    let madeCount = 0;

    const onMade = (index, initializer) => {
      madeInitializers[index] = initializer;
      madeCount += 1;

      if (madeCount === numberOfInitializers) {
        return resolve(madeInitializers);
      }
    };

    items.forEach((data, index) => {
      const { type, properties } = data;

      if (!SUPPORTED_JSON_INITIALIZER_TYPES.includes(type)) {
        return reject(
          `The initializer type ${type} is invalid or not yet supported`
        );
      }

      if (properties.texture) {
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(
          properties.texture,
          loadedTexture =>
            onMade(
              index,
              TextureInitializer.fromJSON({ ...properties, loadedTexture }, THREE)
            ),
          undefined,
          reject
        );

        return;
      }

      onMade(
        index,
        INITIALIZER_TYPES_THAT_REQUIRE_THREE.includes(type)
          ? Initializer[type].fromJSON(properties, THREE)
          : Initializer[type].fromJSON(properties)
      );
    });
  });

/**
 * Makes behaviours from json items.
 *
 * @param {array<object>} items - An array of objects which provide behaviour constructor params
 * @return {Promise<array>}
 */
const makeBehaviours = items =>
  new Promise((resolve, reject) => {
    if (!items.length) {
      return resolve([]);
    }

    const numberOfBehaviours = items.length;
    const madeBehaviours = [];

    items.forEach(data => {
      const { type, properties } = data;

      if (!SUPPORTED_JSON_BEHAVIOUR_TYPES.includes(type)) {
        return reject(
          `The behaviour type ${type} is invalid or not yet supported`
        );
      }

      madeBehaviours.push(Behaviour[type].fromJSON(properties));

      if (madeBehaviours.length === numberOfBehaviours) {
        return resolve(madeBehaviours);
      }
    });
  });

const makeEmitters = (emitters, Emitter, THREE, shouldAutoEmit) =>
  new Promise((resolve, reject) => {
    if (!emitters.length) {
      return resolve([]);
    }

    const numberOfEmitters = emitters.length;

    if (!numberOfEmitters) {
      return resolve([]);
    }

    // Each built emitter is written at its ORIGINAL index, and we resolve once every
    // slot is filled — so system.emitters preserves the input order regardless of how
    // the emitters' async initializer/texture loads interleave. (Previously emitters
    // were pushed as they completed, i.e. in load-resolution order.)
    const madeEmitters = new Array(numberOfEmitters);
    let madeCount = 0;

    emitters.forEach((data, index) => {
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
        .setPosition(position);

      makeInitializers(initializers, THREE)
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

          return Promise.resolve(emitter);
        })
        .then(emitter => {
          madeEmitters[index] = shouldAutoEmit
            ? emitter.emit(totalEmitTimes, life)
            : emitter.setTotalEmitTimes(totalEmitTimes).setLife(life);
          madeCount += 1;

          if (madeCount === numberOfEmitters) {
            return resolve(madeEmitters);
          }
        })
        .catch(reject);
    });
  });

/**
 * Creates a System instance from a JSON object.
 *
 * @param {object} json - The JSON to create the System instance from
 * @param {number} json.preParticles - The predetermined number of particles
 * @param {string} json.integrationType - The integration algorithm to use
 * @param {array<object>} json.emitters - The emitters for the system instance
 * @param {object} THREE - The Web GL Api to use
 * @param {function} System - The system class
 * @param {function} Emitter - The emitter class
 * @param {object} [options={}] - Optional config options
 * @return {Promise<System>}
 */
export default (json, THREE, System, Emitter, options = {}) =>
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
