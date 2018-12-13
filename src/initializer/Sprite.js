import { SpriteMaterial, TextureLoader, Sprite as ThreeSprite } from 'three';

import { DEFAULT_MATERIAL_PROPERTIES } from './constants';
import Initializer from './Initializer';

export default class Sprite extends Initializer {
  constructor(texture, materialProperties = DEFAULT_MATERIAL_PROPERTIES) {
    super('Sprite');

    this.texture = TextureLoader().load(texture);
    this.material = new SpriteMaterial({
      ...{ map: this.texture },
      ...materialProperties
    });
    this.sprite = new ThreeSprite(this.material);
  }

  initialize(particle) {
    particle.body = this.sprite;
  }

  static fromJSON(json) {
    const { texture, materialProperties = DEFAULT_MATERIAL_PROPERTIES } = json;

    return new Sprite(texture, materialProperties);
  }
}
