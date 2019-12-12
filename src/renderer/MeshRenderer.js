import BaseRenderer from './BaseRenderer';
import { PUID } from '../utils';
import { Pool } from '../core';
import { RENDERER_TYPE_MESH as type } from './types';

/**
 * @requires THREE - { Mesh, BoxGeometry, MeshLambertMaterial }
 */
export default class MeshRenderer extends BaseRenderer {
  /**
   * @param {object} container - An Object3D container, usually a THREE.Scene
   * @param {object} THREE - THREE Api
   */
  constructor(container, THREE) {
    super(type);

    this.container = container;
    this._targetPool = new Pool();
    this._materialPool = new Pool();
    this._body = new THREE.Mesh(
      new THREE.BoxGeometry(50, 50, 50),
      new THREE.MeshLambertMaterial({ color: '#ff0000' })
    );
    this.ThreeSprite = THREE.Sprite;
  }

  isThreeSprite(particle) {
    return particle.target instanceof this.ThreeSprite;
  }

  onSystemUpdate() {}

  onParticleCreated(particle) {
    if (!particle.target) {
      //set target
      if (!particle.body) particle.body = this._body;
      particle.target = this._targetPool.get(particle.body);

      //set material
      if (particle.useAlpha || particle.useColor) {
        particle.target.material.__puid = PUID.id(particle.body.material);
        particle.target.material = this._materialPool.get(
          particle.target.material
        );
      }
    }

    if (particle.target) {
      particle.target.position.copy(particle.position);
      this.container.add(particle.target);
    }
  }

  onParticleUpdate(particle) {
    const { target, useAlpha, useColor, rotation } = particle;

    if (!target) {
      return;
    }

    target.position.copy(particle.position);

    if (!this.isThreeSprite(particle)) {
      target.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    this.scale(particle);

    if (useAlpha) {
      target.material.opacity = particle.alpha;
      target.material.transparent = true;
    }

    if (useColor) {
      target.material.color.copy(particle.color);
    }
  }

  scale(particle) {
    particle.target.scale.set(particle.scale, particle.scale, particle.scale);
  }

  onParticleDead(particle) {
    if (particle.target) {
      if (particle.useAlpha || particle.useColor)
        this._materialPool.expire(particle.target.material);

      this._targetPool.expire(particle.target);
      this.container.remove(particle.target);
      particle.target = null;
    }
  }
}
