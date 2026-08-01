import BaseRenderer from './BaseRenderer';
import { PUID } from '../utils';
import { Pool } from '../core';
import { RENDERER_TYPE_MESH as type } from './types';
import type Particle from '../core/Particle';
import type {
  Color,
  Material,
  MeshLambertMaterial,
  Object3D,
  SpriteMaterial,
} from 'three';

interface RenderableTarget extends Object3D {
  material: SpriteMaterial | MeshLambertMaterial | Material;
  isSprite?: boolean;
}

/**
 * @requires THREE - { Mesh, BoxGeometry, MeshLambertMaterial }
 */
export default class MeshRenderer extends BaseRenderer {
  container: Object3D;
  _targetPool: Pool;
  _materialPool: Pool;
  _body: Object3D;

  /**
   * @param container - An Object3D container, usually a THREE.Scene
   * @param THREE - THREE Api
   */
  constructor(container: Object3D, THREE: typeof import('three')) {
    super(type);

    this.container = container;
    this._targetPool = new Pool();
    this._materialPool = new Pool();
    this._body = new THREE.Mesh(
      new THREE.BoxGeometry(50, 50, 50),
      new THREE.MeshLambertMaterial({ color: '#ff0000' })
    );
  }

  isThreeSprite(particle: Particle): boolean {
    return !!(particle.target as RenderableTarget).isSprite;
  }

  onSystemUpdate(): void {}

  onParticleCreated(particle: Particle): void {
    if (!particle.target) {
      //set target
      if (!particle.body) particle.body = this._body;
      particle.target = this._targetPool.get<RenderableTarget>(
        particle.body as RenderableTarget
      );

      //set material
      if (particle.useAlpha || particle.useColor) {
        const target = particle.target as RenderableTarget;

        (target.material as Material & { __puid?: string }).__puid = PUID.id(
          (particle.body as RenderableTarget).material
        );
        target.material = this._materialPool.get(target.material);
      }
    }

    if (particle.target) {
      const target = particle.target as RenderableTarget;

      target.position.copy(particle.position);
      this.container.add(target);
    }
  }

  onParticleUpdate(particle: Particle): void {
    const { useAlpha, useColor } = particle;
    const target = particle.target as RenderableTarget;

    if (!target) {
      return;
    }

    target.position.copy(particle.position);

    this.rotate(particle);

    this.scale(particle);

    if (useAlpha) {
      target.material.opacity = particle.alpha;
      target.material.transparent = true;
    }

    if (useColor) {
      // particle.color is a plain { r, g, b }; three's Color.copy only reads
      // those three fields, so this structural boundary cast is safe.
      (target.material as MeshLambertMaterial).color.copy(
        particle.color as unknown as Color
      );
    }
  }

  rotate(particle: Particle): void {
    const target = particle.target as RenderableTarget;

    target.rotation.set(
      particle.rotation.x,
      particle.rotation.y,
      particle.rotation.z
    );
  }

  scale(particle: Particle): void {
    const target = particle.target as RenderableTarget;

    target.scale.set(particle.scale, particle.scale, particle.scale);
  }

  onParticleDead(particle: Particle): void {
    if (particle.target) {
      const target = particle.target as RenderableTarget;

      if (particle.useAlpha || particle.useColor)
        this._materialPool.expire(target.material);

      this._targetPool.expire(target);
      this.container.remove(target);
      particle.target = null;
    }
  }
}
