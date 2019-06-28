import BaseRenderer from './BaseRenderer';
import { PUID } from '../utils';
import { Pool } from '../core';
import { RENDERER_TYPE_MESH as type } from './types';

export default class MeshRenderer extends BaseRenderer {
  constructor(THREE, container) {
    super(type);

    this.container = container;

    this._targetPool = new Pool();
    this._materialPool = new Pool();
    this._body = new THREE.Mesh(
      new THREE.BoxGeometry(50, 50, 50),
      new THREE.MeshLambertMaterial({ color: '#ff0000' })
    );
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
    if (particle.target) {
      particle.target.position.copy(particle.position);
      particle.target.rotation.set(
        particle.rotation.x,
        particle.rotation.y,
        particle.rotation.z
      );
      this.scale(particle);

      if (particle.useAlpha) {
        particle.target.material.opacity = particle.alpha;
        particle.target.material.transparent = true;
      }

      if (particle.useColor) {
        particle.target.material.color.copy(particle.color);
      }
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
