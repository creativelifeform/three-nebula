import MeshRenderer from './MeshRenderer';
import { RENDERER_TYPE_SPRITE as type } from './types';
import type Particle from '../core/Particle';
import type { Material, Object3D, SpriteMaterial } from 'three';

interface RenderableTarget extends Object3D {
  material: SpriteMaterial | Material;
}

/**
 * @requires THREE - { Mesh, BoxGeometry, MeshLambertMaterial, Sprite, SpriteMaterial }
 */
export default class SpriteRenderer extends MeshRenderer {
  constructor(container: Object3D, THREE: typeof import('three')) {
    super(container, THREE);

    /**
     * @desc The class type.
     */
    this.type = type;
    this._body = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffffff })
    );
  }

  rotate(particle: Particle): void {
    const target = particle.target as RenderableTarget;

    (target.material as SpriteMaterial).rotation = particle.rotation.z;
  }

  scale(particle: Particle): void {
    const target = particle.target as RenderableTarget;

    target.scale.set(
      particle.scale * particle.radius,
      particle.scale * particle.radius,
      1
    );
  }
}
