/*global describe, it */

import * as Proton from '../src';

import chai from 'chai';

const { assert } = chai;

describe('modules', () => {
  it('should export all the required modules', done => {
    const modules = [
      'BoxZone',
      'LineZone',
      'MeshZone',
      'PointZone',
      'ScreenZone',
      'SphereZone',
      'Body',
      'Life',
      'Mass',
      'Position',
      'Radius',
      'Rate',
      'Velocity',
      'Alpha',
      'Attraction',
      'Collision',
      'Color',
      'CrossZone',
      'Force',
      'Gravity',
      'RandomDrift',
      'Repulsion',
      'Rotate',
      'Scale',
      'Spring',
      'BehaviourEmitter',
      'Emitter',
      'FollowEmitter',
      'Particle',
      'Pool',
      'Box'
    ];

    modules.forEach(module => assert.isFunction(Proton[module]));

    done();
  });

  it('should export a default module which is the Proton class', done => {
    assert.isFunction(Proton.default);

    const proton = new Proton.default();

    assert.strictEqual(proton.constructor.name, 'Proton');

    done();
  });
});
