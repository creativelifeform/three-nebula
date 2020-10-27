/* global describe, it */

import * as THREE from 'three';

import { Particle, Pool } from '../../src/core';

import { MeshRenderer } from '../../src/renderer';
import chai from 'chai';
import sinon from 'sinon';

const { assert } = chai;
const { spy } = sinon;

describe('renderer -> MeshRenderer', () => {
  describe('constructor', () => {
    it('should construct the renderer correctly', () => {
      const container = new THREE.Scene();
      const renderer = new MeshRenderer(container, THREE);

      assert.instanceOf(renderer._targetPool, Pool);
      assert.instanceOf(renderer._materialPool, Pool);
      assert.instanceOf(renderer._body, THREE.Mesh);
    });
  });

  describe('onParticleCreated', () => {
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

    it('should set the particle target material if it is using color', () => {
      const container = new THREE.Scene();
      const particle = new Particle();
      const renderer = new MeshRenderer(container, THREE);

      particle.useColor = true;

      renderer.onParticleCreated(particle);

      assert.instanceOf(particle.target.material, THREE.Material);
      assert.exists(particle.target.material.__puid);
    });

    it('should add the particle target to the container if it already has one', () => {
      const container = new THREE.Scene();
      const particle = new Particle();
      const renderer = new MeshRenderer(container, THREE);

      particle.useColor = true;
      particle.useAlpha = true;

      renderer.onParticleCreated(particle);

      const targetPoolGetSpy = spy(renderer._targetPool, 'get');
      const materialPoolGetSpy = spy(renderer._materialPool, 'get');
      const particlePositionCopySpy = spy(particle.target.position, 'copy');
      const containerAddSpy = spy(container, 'add');

      renderer.onParticleCreated(particle);

      assert(targetPoolGetSpy.notCalled);
      assert(materialPoolGetSpy.notCalled);
      assert(particlePositionCopySpy.calledOnceWith(particle.position));
      assert(containerAddSpy.calledOnceWith(particle.target));
    });
  });

  describe('onParticleUpdate', () => {
    const setup = () => {
      const container = new THREE.Scene();
      const particle = new Particle();
      const renderer = new MeshRenderer(container, THREE);

      // Ensure the particle has a target
      renderer.onParticleCreated(particle);

      return {
        container,
        particle,
        renderer,
      };
    };

    it('should copy the particle position, set its rotation and scale it if it has a target', () => {
      const { particle, renderer } = setup();

      const targetPositionCopySpy = spy(particle.target.position, 'copy');
      const targetRotationSetSpy = spy(particle.target.rotation, 'set');
      const scaleSpy = spy(renderer, 'scale');

      renderer.onParticleUpdate(particle);

      assert(targetPositionCopySpy.calledOnceWith(particle.position));
      assert(
        targetRotationSetSpy.calledOnceWith(
          particle.rotation.x,
          particle.rotation.y,
          particle.rotation.z
        )
      );
      assert(scaleSpy.calledOnceWith(particle));
    });

    it('should not set target rotation if the target is a THREE Sprite', () => {
      const container = new THREE.Scene();
      const particle = new Particle();
      const renderer = new MeshRenderer(container, THREE);

      particle.body = new THREE.Sprite(
        new THREE.SpriteMaterial({
          color: 0xff0000,
          blending: THREE.AdditiveBlending,
          fog: true,
        })
      );

      // Ensure the particle has a target
      renderer.onParticleCreated(particle);

      const targetRotationSetSpy = spy(particle.target.rotation, 'set');

      renderer.onParticleUpdate(particle);

      assert(targetRotationSetSpy.notCalled);
    });

    it("should set the target's material opacity and transparency if the particle is using alpha", () => {
      const { particle, renderer } = setup();

      particle.useAlpha = true;
      particle.alpha = 0.7;

      renderer.onParticleUpdate(particle);

      assert.strictEqual(particle.target.material.opacity, particle.alpha);
      assert.isTrue(particle.target.material.transparent);
    });

    it("should copy the target's material color if the particle is using color", () => {
      const { particle, renderer } = setup();
      const copySpy = spy(particle.target.material.color, 'copy');

      particle.useColor = true;

      renderer.onParticleUpdate(particle);

      assert(copySpy.calledOnceWith(particle.color));
    });

    it('should set the target scale to the particle scale', () => {
      const { particle, renderer } = setup();
      const { scale } = particle;
      const scaleSetSpy = spy(particle.target.scale, 'set');

      renderer.onParticleUpdate(particle);

      assert(scaleSetSpy.calledOnceWith(scale, scale, scale));
    });
  });

  describe('onParticleDead', () => {
    const setup = () => {
      const container = new THREE.Scene();
      const particle = new Particle();
      const renderer = new MeshRenderer(container, THREE);

      // Ensure the particle has a target
      renderer.onParticleCreated(particle);

      return {
        container,
        particle,
        renderer,
      };
    };

    it('should expire the target material if the particle is using alpha', () => {
      const { particle, renderer } = setup();
      const { material } = particle.target;
      const materialPoolExpireSpy = spy(renderer._materialPool, 'expire');

      particle.useAlpha = true;

      renderer.onParticleDead(particle);

      assert(materialPoolExpireSpy.calledOnceWith(material));
    });

    it('should expire the target material if the particle is using color', () => {
      const { particle, renderer } = setup();
      const { material } = particle.target;
      const materialPoolExpireSpy = spy(renderer._materialPool, 'expire');

      particle.useColor = true;

      renderer.onParticleDead(particle);

      assert(materialPoolExpireSpy.calledOnceWith(material));
    });

    it('should expire the target, remove the target from the container and null the target', () => {
      const { particle, renderer, container } = setup();
      const { target } = particle;
      const targetPoolExpireSpy = spy(renderer._targetPool, 'expire');
      const containerRemoveSpy = spy(container, 'remove');

      renderer.onParticleDead(particle);

      assert(targetPoolExpireSpy.calledOnceWith(target));
      assert(containerRemoveSpy.calledOnceWith(target));
      assert.isNull(particle.target);
    });
  });
});
