import MeshRenderer from './MeshRenderer';
import { RENDERER_TYPE_SPRITE as type } from './types';

/**
 * @requires THREE - { Mesh, BoxGeometry, MeshLambertMaterial, Sprite, SpriteMaterial }
 */
export default class SpriteRenderer extends MeshRenderer {
  constructor(container, THREE) {
    super(container, THREE);

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
    this._body = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffffff })
    );
  }

  scale(particle) {
    particle.target.scale.set(
      particle.scale * particle.radius,
      particle.scale * particle.radius,
      1
    );
  }
}
