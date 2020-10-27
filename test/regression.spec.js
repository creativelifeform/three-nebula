/*global describe, it */

import * as Nebula from '../src';

import chai from 'chai';

const { assert, expect } = chai;

describe('regression', () => {
  it('should export all the required modules', done => {
    const modules = [
      'Particle',
      'Pool',
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
      'Debug',
      'log',
      'setEasingByName',
      'FollowEmitter',
      'Emitter',
      'Body',
      'InitializerUtil',
      'Life',
      'Mass',
      'Position',
      'Radius',
      'Rate',
      'PolarVelocity',
      'RadialVelocity',
      'VectorVelocity',
      'ArraySpan',
      'createArraySpan',
      'Box',
      'integrate',
      'MathUtils',
      'Polar3D',
      'Span',
      'createSpan',
      'Vector3D',
      'CustomRenderer',
      'MeshRenderer',
      'GPURenderer',
      'SpriteRenderer',
      'ColorUtil',
      'PUID',
      'THREEUtil',
      'Util',
      'uid',
      'BoxZone',
      'LineZone',
      'MeshZone',
      'PointZone',
      'ScreenZone',
      'SphereZone',
      'ease',
    ];

    modules.forEach(module => expect(Nebula).to.have.property(module));

    done();
  });

  it('should export a default module which is the System class', done => {
    assert.isFunction(Nebula.default);

    const system = new Nebula.default();

    assert.strictEqual(system.constructor.name, 'System');

    done();
  });

  it('should export a named module which is the System class', done => {
    assert.isFunction(Nebula.System);

    const system = new Nebula.System();

    assert.strictEqual(system.constructor.name, 'System');

    done();
  });

  it('should export the behaviour base class for extension', done => {
    assert.isFunction(Nebula.Behaviour);

    const behaviour = new Nebula.Behaviour();

    assert.strictEqual(behaviour.constructor.name, 'Behaviour');

    done();
  });
});
