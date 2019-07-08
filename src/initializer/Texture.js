import {
  DEFAULT_JSON_MATERIAL_PROPERTIES,
  DEFAULT_MATERIAL_PROPERTIES,
  SUPPORTED_MATERIAL_BLENDING_MODES,
} from './constants';

import Initializer from './Initializer';
import { INITIALIZER_TYPE_TEXTURE as type } from './types';
import { withDefaults } from '../utils';

/**
 * Sets the body property to be a THREE.Sprite with a texture map on initialized particles.
 *
 */
export default class Texture extends Initializer {
  /**
   * Constructs an Texture initializer.
   *
   * @param {object} THREE - The Web GL API we are using eg., THREE
   * @param {string} texture - The sprite texture
   * @param {object|undefined} materialProperties - The sprite material properties
   * @param {?Texture} loadedTexture - Preloaded THREE.Texture instance
   */
  constructor(
    THREE,
    loadedTexture,
    materialProperties = DEFAULT_MATERIAL_PROPERTIES,
    isEnabled = true
  ) {
    super(type, isEnabled);

    const { Sprite, SpriteMaterial } = THREE;

    /**
     * @desc The material properties for this object's SpriteMaterial
     * NOTE This is required for testing purposes
     * @type {object}
     */
    this.materialProperties = withDefaults(
      DEFAULT_MATERIAL_PROPERTIES,
      materialProperties
    );

    /**
     * @desc The texture for the THREE.SpriteMaterial map.
     * @type {Texture}
     */
    this.texture = loadedTexture;

    /**
     * @desc THREE.SpriteMaterial instance.
     * @type {SpriteMaterial}
     */
    this.material = new SpriteMaterial({
      ...{ map: loadedTexture },
      ...this.materialProperties,
    });

    /**
     * @desc THREE.Sprite instance.
     * @type {Sprite}
     */
    this.sprite = new Sprite(this.material);
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
   * Creates a Texture initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from
   * @param {object} THREE - The Web GL API we are using eg., THREE
   * @param {Texture} json.loadedTexture - The loaded sprite texture
   * @param {object} json.materialProperties - The sprite material properties
   * @return {BodySprite}
   */
  static fromJSON(json, THREE) {
    const {
      loadedTexture,
      materialProperties = DEFAULT_JSON_MATERIAL_PROPERTIES,
      isEnabled = true,
    } = json;

    const ensureMappedBlendingMode = properties => {
      const { blending } = properties;

      return {
        ...properties,
        blending: blending
          ? SUPPORTED_MATERIAL_BLENDING_MODES[blending]
          : SUPPORTED_MATERIAL_BLENDING_MODES[
            DEFAULT_JSON_MATERIAL_PROPERTIES.blending
          ],
      };
    };

    return new Texture(
      THREE,
      loadedTexture,
      withDefaults(
        DEFAULT_JSON_MATERIAL_PROPERTIES,
        ensureMappedBlendingMode(materialProperties)
      ),
      isEnabled
    );
  }
}
