import MeshRenderer from './MeshRenderer';
import { THREE } from '../core';
import { RENDERER_TYPE_SPRITE as type } from './types';

export default class SpriteRenderer extends MeshRenderer {
  constructor(container) {
    super(container);

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
