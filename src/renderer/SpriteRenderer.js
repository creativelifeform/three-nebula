import { Sprite, SpriteMaterial } from 'three';

import MeshRenderer from './MeshRenderer';

export default class SpriteRenderer extends MeshRenderer {
  constructor(container) {
    super(container);

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
