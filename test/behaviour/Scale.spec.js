/*global describe, it */

import * as Proton from '../../src';

import { TIME } from '../constants';
import chai from 'chai';

const { assert } = chai;

describe('behaviour -> Scale', () => {
  const behaviour = new Proton.Scale(1, 2);

  it('will set the same property to true if second arg is null or undefined', done => {
    const scaleA = new Proton.Scale(1, null);
    const scaleB = new Proton.Scale(1);

    assert.isTrue(scaleA._same);
    assert.isTrue(scaleB._same);

    done();
  });

  it('should instantiate with the correct properties', done => {
    const { life, easing, age, energy, dead, _same } = behaviour;

    assert.strictEqual(life, Infinity);
    assert.isFunction(easing);
    assert.strictEqual(age, 0);
    assert.strictEqual(energy, 1);
    assert.isFalse(dead);
    assert.isFalse(_same);

    done();
  });

  it('should have set the correct properties on the particle after applying the behaviour', done => {
    const particle = new Proton.Particle();

    behaviour.applyBehaviour(particle, TIME);

    done();
  });
});
