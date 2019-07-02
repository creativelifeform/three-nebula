import * as Behaviour from '../behaviour';
import * as Initializer from '../initializer';

import { EULER, POOL_MAX } from '../constants';
import {
  INITIALIZER_TYPES_THAT_REQUIRE_THREE,
  SUPPORTED_JSON_BEHAVIOUR_TYPES,
  SUPPORTED_JSON_INITIALIZER_TYPES,
} from './constants';

import Rate from '../initializer/Rate';

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
 * @return {array<Initializer>}
 */
const makeInitializers = (items, THREE) => {
  const initializers = [];

  items.forEach(data => {
    const { type, properties } = data;

    if (!SUPPORTED_JSON_INITIALIZER_TYPES.includes(type)) {
      throw new Error(
        `The initializer type ${type} is invalid or not yet supported`
      );
    }

    if (INITIALIZER_TYPES_THAT_REQUIRE_THREE.includes(type)) {
      initializers.push(new Initializer[type].fromJSON(properties, THREE));
    } else {
      initializers.push(new Initializer[type].fromJSON(properties));
    }
  });

  return initializers;
};

/**
 * Makes behaviours from json items.
 *
 * @param {array<object>} items - An array of objects which provide behaviour constructor params
 * @return {array<Behaviour>}
 */
const makeBehaviours = items => {
  const behaviours = [];

  items.forEach(data => {
    const { type, properties } = data;

    if (!SUPPORTED_JSON_BEHAVIOUR_TYPES.includes(type)) {
      throw new Error(
        `The behaviour type ${type} is invalid or not yet supported`
      );
    }

    behaviours.push(new Behaviour[type].fromJSON(properties));
  });

  return behaviours;
};

/**
 * Creates a System instance from a JSON object.
 *
 * @param {object} json - The JSON to create the System instance from
 * @param {object} THREE - The Web GL Api to use
 * @param {function} System - The system class
 * @param {function} Emitter - The emitter class
 * @param {number} json.preParticles - The predetermined number of particles
 * @param {string} json.integrationType - The integration algorithm to use
 * @param {array<object>} json.emitters - The emitters for the system instance
 * @return {System}
 */
export default (json, THREE, System, Emitter) => {
  const {
    preParticles = POOL_MAX,
    integrationType = EULER,
    emitters = [],
  } = json;
  const system = new System(THREE, preParticles, integrationType);

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
      .setInitializers(makeInitializers(initializers, THREE))
      .setBehaviours(makeBehaviours(behaviours))
      .setEmitterBehaviours(makeBehaviours(emitterBehaviours))
      .setPosition(position)
      .emit(totalEmitTimes, life);

    system.addEmitter(emitter);
  });

  return system;
};
