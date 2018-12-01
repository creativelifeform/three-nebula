/*global describe, it */

import * as Proton from '../../../src';

import InitializeUtil from '../../../src/initialize/InitializeUtil';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const { spy } = sinon;

describe('initializer -> InitializeUtil', () => {
  const mass = new Proton.Mass(1);
  const life = new Proton.Life(2);
  const body = new Proton.Body('#FF0000');
  const radius = new Proton.Radius(80);
  const velocity = new Proton.Velocity(200, new Proton.Vector3D(0, 0, -1), 0);
  const emitter = new Proton.Emitter();
  const particle = new Proton.Particle();
  const initializers = [mass, life, body, radius, velocity];

  it('should run each initializer\'s initialize method on all particles', done => {
    const massSpy = spy(mass, 'initialize');
    const lifeSpy = spy(life, 'initialize');
    const bodySpy = spy(body, 'initialize');
    const radiusSpy = spy(radius, 'initialize');
    const velocitySpy = spy(velocity, 'initialize');
    const spies = [massSpy, lifeSpy, bodySpy, radiusSpy, velocitySpy];

    InitializeUtil.initialize(emitter, particle, initializers);

    spies.forEach(spy => {
      assert(spy.calledOnce);
      assert(spy.calledWith(particle));
    });
    spies.forEach(spy => spy.restore());

    done();
  });
});
