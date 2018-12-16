import { Sprite, SpriteMaterial, TextureLoader } from 'three';

import { DEFAULT_MATERIAL_PROPERTIES } from './constants';
import Initializer from './Initializer';

/**
 * Sets the body property to be a THREE.Sprite on initialized particles.
 *
 */
export default class BodySprite extends Initializer {
  /**
   * Constructs a BodySprite initializer.
   *
   * @param {string} texture - The sprite texture
   * @param {object} materialProperties - The sprite material properties
   */
  constructor(texture, materialProperties = DEFAULT_MATERIAL_PROPERTIES) {
    super();

    new TextureLoader().load(texture, map => {
      /**
       * @desc The texture for the THREE.SpriteMaterial map.
       * @type {Texture}
       */
      this.texture = map;

      /**
       * @desc THREE.SpriteMaterial instance.
       * @type {SpriteMaterial}
       */
      this.material = new SpriteMaterial({
        ...{ map },
        ...materialProperties
      });

      /**
       * @desc THREE.Sprite instance.
       * @type {Sprite}
       */
      this.sprite = new Sprite(this.material);
    });
  }

  /**
   * Sets the particle body to the sprite.
   *
   * @param {Particle} particle - The particle to set the body of
   * @return void
   */
  initialize(particle) {
    particle.body = this.sprite;
  }

  /**
   * Creates a BodySprite initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @param {string} json.texture - The sprite texture
   * @param {object} json.materialProperties - The sprite material properties
   * @return {BodySprite}
   */
  static fromJSON(json) {
    const { texture, materialProperties = DEFAULT_MATERIAL_PROPERTIES } = json;

    return new BodySprite(texture, materialProperties);
  }
}
