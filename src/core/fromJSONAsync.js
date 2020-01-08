import * as Behaviour from '../behaviour';
import * as Initializer from '../initializer';

import { EULER, POOL_MAX } from '../constants';
import {
  INITIALIZER_TYPES_THAT_REQUIRE_THREE,
  SUPPORTED_JSON_BEHAVIOUR_TYPES,
  SUPPORTED_JSON_INITIALIZER_TYPES,
} from './constants';

import Rate from '../initializer/Rate';
import TextureInitializer from '../initializer/Texture';

/**
 * Makes a rate instance.
 *
 * @param {object} json - The data required to construct a Rate instance
 * @return {Rate}
 */
const makeRate = json => new Rate.fromJSON(json);

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
    const madeInitializers = [];
    const doNotRequireTextureLoading = items.filter(
      ({ properties }) => !properties.texture
    );
    const doRequireTextureLoading = items.filter(
      ({ properties }) => properties.texture
    );

    doNotRequireTextureLoading.forEach(data => {
      const { type, properties } = data;

      if (!SUPPORTED_JSON_INITIALIZER_TYPES.includes(type)) {
        return reject(
          `The initializer type ${type} is invalid or not yet supported`
        );
      }

      if (INITIALIZER_TYPES_THAT_REQUIRE_THREE.includes(type)) {
        madeInitializers.push(
          new Initializer[type].fromJSON(properties, THREE)
        );
      } else {
        madeInitializers.push(new Initializer[type].fromJSON(properties));
      }

      if (madeInitializers.length === numberOfInitializers) {
        return resolve(madeInitializers);
      }
    });

    doRequireTextureLoading.forEach(data => {
      const {
        type,
        properties,
        properties: { texture },
      } = data;
      const textureLoader = new THREE.TextureLoader();

      if (!SUPPORTED_JSON_INITIALIZER_TYPES.includes(type)) {
        return reject(
          `The initializer type ${type} is invalid or not yet supported`
        );
      }

      textureLoader.load(
        texture,
        loadedTexture => {
          madeInitializers.push(
            new TextureInitializer.fromJSON(
              {
                ...properties,
                loadedTexture,
              },
              THREE
            )
          );

          if (madeInitializers.length === numberOfInitializers) {
            return resolve(madeInitializers);
          }
        },
        undefined,
        reject
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

      madeBehaviours.push(new Behaviour[type].fromJSON(properties));

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

    const madeEmitters = [];
    const numberOfEmitters = emitters.length;

    if (!numberOfEmitters) {
      return resolve(madeEmitters);
    }

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
      } = data;

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
          madeEmitters.push(
            shouldAutoEmit
              ? emitter.emit(totalEmitTimes, life)
              : emitter.setTotalEmitTimes(totalEmitTimes).setLife(life)
          );

          if (madeEmitters.length === numberOfEmitters) {
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
 * @param {object} options - Optional config options
 * @param {boolean} [options.shouldAutoEmit=true] - Determines if the system should automatically emit particles
 * @return {Promise<System>}
 */
export default (json, THREE, System, Emitter, { shouldAutoEmit = true } = {}) =>
  new Promise((resolve, reject) => {
    const {
      preParticles = POOL_MAX,
      integrationType = EULER,
      emitters = [],
    } = json;
    const system = new System(preParticles, integrationType);

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
