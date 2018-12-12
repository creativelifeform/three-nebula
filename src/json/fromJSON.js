import * as Behaviour from '../behaviour';
import * as Initializer from '../initializer';

import { EULER, POOL_MAX } from '../constants';
import {
  SUPPORTED_BEHAVIOUR_TYPES,
  SUPPORTED_INITIALIZER_TYPES
} from './constants';

import { Emitter } from '../emitter';
import { Proton } from '../core';
import Rate from '../initializer/Rate';

export default json => {
  const {
    preParticles = POOL_MAX,
    integrationType = EULER,
    emitters = []
  } = json;
  const proton = new Proton(preParticles, integrationType);

  emitters.forEach(emitterData => {
    const emitter = new Emitter();
    const { rate, initializers, behaviours } = emitterData;

    emitter
      .setRate(makeRate(rate))
      .setInitializers(makeInitializers(initializers))
      .setBehaviours(makeBehaviours(behaviours));

    proton.addEmitter(emitter);
  });

  return proton;
};

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
 * @param {array<object>} items - An array of objects which can be used to instantiate initializer instances.
 * @return {array<Initializer>}
 */
const makeInitializers = items => {
  const initializers = [];

  items.forEach(data => {
    const { type, properties } = data;

    if (!SUPPORTED_INITIALIZER_TYPES.includes(type)) {
      throw new Error(
        `The initializer type ${type} is invalid or not yet supported`
      );
    }

    initializers.push(new Initializer[type].fromJSON(properties));
  });

  return initializers;
};

/**
 * Makes behaviours from json items.
 *
 * @param {array<object>} items - An array of objects which can be used to instantiate behaviour instances.
 * @return {array<Behaviour>}
 */
const makeBehaviours = items => {
  const behaviours = [];

  items.forEach(data => {
    const { type, properties } = data;

    if (!SUPPORTED_BEHAVIOUR_TYPES.includes(type)) {
      throw new Error(
        `The behaviour type ${type} is invalid or not yet supported`
      );
    }

    behaviours.push(new Behaviour[type].fromJSON(properties));
  });

  return behaviours;
};
