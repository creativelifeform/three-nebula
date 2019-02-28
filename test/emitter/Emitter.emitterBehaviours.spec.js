/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';
import sinon from 'sinon';

const { spy } = sinon;
const { assert } = chai;
const { Emitter } = Proton;

describe('emitter -> Emitter -> emitterBehaviours', () => {
  it("should add a behaviour to the emitter's behaviours and call the behaviour's initialize method passing the emitter", done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();
    const attractionInitializeSpy = spy(attraction, 'initialize');

    assert.instanceOf(emitter.addEmitterBehaviour(attraction), Emitter);
    assert.lengthOf(emitter.emitterBehaviours, 1);
    assert.deepEqual(emitter.emitterBehaviours[0], attraction);
    assert(attractionInitializeSpy.calledOnceWith(emitter));

    attractionInitializeSpy.restore();

    done();
  });

  it("should add all the behaviours to the emitter's emitter behaviours", done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();
    const repulsion = new Proton.Repulsion();
    const gravity = new Proton.Gravity();
    const behaviours = [attraction, repulsion, gravity];

    assert.instanceOf(emitter.addEmitterBehaviours(behaviours), Emitter);
    assert.lengthOf(emitter.emitterBehaviours, behaviours.length);
    assert.instanceOf(emitter.emitterBehaviours[0], Proton.Gravity);
    assert.instanceOf(emitter.emitterBehaviours[1], Proton.Repulsion);
    assert.instanceOf(emitter.emitterBehaviours[2], Proton.Attraction);

    done();
  });

  it("should set the emitter's emitter behaviours to the behaviours passed", done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();
    const repulsion = new Proton.Repulsion();
    const gravity = new Proton.Gravity();
    const behaviours = [attraction, repulsion, gravity];

    assert.instanceOf(emitter.setEmitterBehaviours(behaviours), Emitter);
    assert.lengthOf(emitter.emitterBehaviours, behaviours.length);
    assert.deepEqual(emitter.emitterBehaviours, behaviours);

    done();
  });

  it("should remove the emitter's emitter behaviour", done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();
    const repulsion = new Proton.Repulsion();
    const gravity = new Proton.Gravity();
    const behaviours = [attraction, repulsion, gravity];

    emitter.setEmitterBehaviours(behaviours);
    emitter.removeEmitterBehaviour(repulsion);

    assert.lengthOf(emitter.emitterBehaviours, 2);
    assert.deepEqual(emitter.emitterBehaviours, [attraction, gravity]);

    done();
  });

  it("should remove all of the emitter's emitter behaviours", done => {
    const emitter = new Emitter();

    emitter.setEmitterBehaviours([
      new Proton.Attraction(),
      new Proton.Repulsion(),
      new Proton.Gravity(),
    ]);

    assert.instanceOf(emitter.removeAllEmitterBehaviours(), Emitter);
    assert.empty(emitter.behaviours);

    done();
  });
});

describe('emitter -> Emitter -> updateEmitterBehaviours', () => {
  it('should call the updateEmitterBehaviours method when calling update', done => {
    const emitter = new Emitter();
    const updateEmitterBehavioursSpy = spy(emitter, 'updateEmitterBehaviours');

    emitter.update(TIME);

    assert(updateEmitterBehavioursSpy.calledOnceWith(TIME));

    updateEmitterBehavioursSpy.restore();

    done();
  });

  it("should update the emitter's properties after an emitter behaviour has been added and the emitter has been updated", done => {
    const emitter = new Emitter();
    const attraction = new Proton.Attraction();
    const repulsion = new Proton.Repulsion();
    const gravity = new Proton.Gravity();
    const behaviours = [attraction, repulsion, gravity];
    const emitterBehaviour = new Proton.Rotate(1, 0, 0);
    const before = { ...emitter.rotation };
    let after;

    emitter
      .setBehaviours(behaviours)
      .setEmitterBehaviours([emitterBehaviour])
      .update(TIME);

    after = emitter.rotation;

    assert.notEqual(before.x, after.x);

    done();
  });
});
