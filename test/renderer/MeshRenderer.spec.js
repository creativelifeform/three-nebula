/* global describe, it */

import * as THREE from 'three';

import { Particle, Pool } from '../../src/core';

import { MeshRenderer } from '../../src/renderer';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;

describe('renderer -> MeshRenderer', () => {
  it('should construct the renderer correctly', () => {
    const container = new THREE.Scene();
    const renderer = new MeshRenderer(container, THREE);

    assert.instanceOf(renderer._targetPool, Pool);
    assert.instanceOf(renderer._materialPool, Pool);
    assert.instanceOf(renderer._body, THREE.Mesh);
  });

  it('should set the particle target if none exists', () => {
    const container = new THREE.Scene();
    const particle = new Particle();
    const renderer = new MeshRenderer(container, THREE);

    assert.isNull(particle.body);
    assert.isUndefined(particle.target);
    renderer.onParticleCreated(particle);
    assert.instanceOf(particle.body, THREE.Mesh);
    assert.instanceOf(particle.target, THREE.Mesh);
    assert.instanceOf(particle.target.parent, THREE.Scene);
  });

  it('should set the particle target material if it is using alpha', () => {
    const container = new THREE.Scene();
    const particle = new Particle();
    const renderer = new MeshRenderer(container, THREE);

    particle.useAlpha = true;

    renderer.onParticleCreated(particle);

    assert.instanceOf(particle.target.material, THREE.Material);
    assert.exists(particle.target.material.__puid);
  });
});
