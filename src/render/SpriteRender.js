import { Sprite, SpriteMaterial } from 'three';

import MeshRender from './MeshRender';

export default class SpriteRender extends MeshRender {
  constructor(container) {
    super(container);

    this._body = new Sprite(new SpriteMaterial({ color: 0xffffff }));
    this.name = 'SpriteRender';
  }

  scale(particle) {
    particle.target.scale.set(
      particle.scale * particle.radius,
      particle.scale * particle.radius,
      1
    );
  }
}
