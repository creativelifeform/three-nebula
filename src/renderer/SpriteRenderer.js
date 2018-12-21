import { Sprite, SpriteMaterial } from 'three';

import MeshRenderer from './MeshRenderer';
import { RENDERER_TYPE_SPRITE as type } from './types';

export default class SpriteRenderer extends MeshRenderer {
  constructor(container) {
    super(container);

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
    this._body = new Sprite(new SpriteMaterial({ color: 0xffffff }));
  }

  scale(particle) {
    particle.target.scale.set(
      particle.scale * particle.radius,
      particle.scale * particle.radius,
      1
    );
  }
}
