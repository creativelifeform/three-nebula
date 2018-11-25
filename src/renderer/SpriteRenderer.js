import { Sprite, SpriteMaterial } from 'three';

import MeshRenderer from './MeshRenderer';
import { classDeprecationWarning } from '../compatibility';

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

export class SpriteRender extends SpriteRenderer {
  constructor(...args) {
    super(...args);
    console.warn(classDeprecationWarning('SpriteRender', 'SpriteRenderer'));
  }
}
