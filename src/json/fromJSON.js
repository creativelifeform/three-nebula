import * as Behaviour from '../behaviour';
import * as Zone from '../zone';

import {
  Body,
  Life,
  Mass,
  Position,
  Radius,
  Rate,
  Velocity
} from '../initializer';
import { EULER, POOL_MAX } from '../constants';
import { isTypeBody, isTypeLife, isTypeZone } from './utils';

import { Emitter } from '../emitter';
import { Proton } from '../core';
import { Span } from '../math';

export default json => {
  const {
    preParticles = POOL_MAX,
    integrationType = EULER,
    emitters = []
  } = json;
  const proton = new Proton(preParticles, integrationType);

  emitters.forEach(emitterData => {
    const emitter = new Emitter();
    const behavioursToSet = [];
    const { rate, initializers, behaviours } = emitterData;

    emitter
      .setRate(makeRate(rate))
      .setInitializers(makeInitializers(initializers))
      .setBehaviours(makeBehaviours(behaviours));

    proton.addEmitter(emitter);
  });

  return proton;
};

const makeRate = props => {
  const { particlesMin, particlesMax, perSecondMin, perSecondMax } = props;

  return new Rate(
    new Span(particlesMin, particlesMax),
    new Span(perSecondMin, perSecondMax)
  );
};

const makeInitializers = items => {
  const initializers = [];

  items.forEach(data => {
    const { type, properties } = data;
    let initializer;

    if (isTypeZone(type)) {
      const { zoneType, ...zoneParams } = properties;

      initializer = new Position(new Zone[zoneType](...zoneParams));
    }

    if (isTypeBody(type)) {
      initializer = new Body(...properties);
    }

    if (isTypeLife(type)) {
      initializer = new Life(...properties);
    }

    initializers.push(initializer);
  });

  return initializers;
};

const makeBehaviours = items => {
  const behaviours = [];

  items.forEach(data => {
    const { type, properties } = data;
  });

  return behaviours;
};
