/*global describe, it */

import * as Proton from '../src';

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
      'PointsRenderer',
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

    modules.forEach(module => expect(Proton).to.have.property(module));

    done();
  });

  it('should export a default module which is the Proton class', done => {
    assert.isFunction(Proton.default);

    const proton = new Proton.default();

    assert.strictEqual(proton.constructor.name, 'Proton');

    done();
  });

  it('should export a named module which is the Proton class', done => {
    assert.isFunction(Proton.Proton);

    const proton = new Proton.Proton();

    assert.strictEqual(proton.constructor.name, 'Proton');

    done();
  });
});
