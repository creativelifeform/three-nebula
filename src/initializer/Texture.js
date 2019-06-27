import {
  getDefaultJsonMaterialProperties,
  getDefaultMaterialProperties,
  getSupportedMaterialBlendingModes,
} from './constants';

import Initializer from './Initializer';
import { THREE } from '../core';
import { INITIALIZER_TYPE_TEXTURE as type } from './types';
import { withDefaults } from '../utils';

/**
 * Sets the body property to be a THREE.THREE.Sprite with a texture map on initialized particles.
 *
 */
export default class Texture extends Initializer {
  /**
   * Constructs an Texture initializer.
   *
   * @param {string} texture - The sprite texture
   * @param {object|undefined} materialProperties - The sprite material properties
   * @param {?Texture} loadedTexture - Preloaded THREE.Texture instance
   */
  constructor(
    loadedTexture,
    materialProperties = getDefaultMaterialProperties(),
    isEnabled = true
  ) {
    super(type, isEnabled);

    /**
     * @desc The material properties for this object's THREE.SpriteMaterial
     * NOTE This is required for testing purposes
     * @type {object}
     */
    this.materialProperties = withDefaults(
      getDefaultMaterialProperties(),
      materialProperties
    );

    /**
     * @desc The texture for the THREE.THREE.SpriteMaterial map.
     * @type {Texture}
     */
    this.texture = loadedTexture;

    /**
     * @desc THREE.THREE.SpriteMaterial instance.
     * @type {THREE.SpriteMaterial}
     */
    this.material = new THREE.SpriteMaterial({
      ...{ map: loadedTexture },
      ...this.materialProperties,
    });

    /**
     * @desc THREE.THREE.Sprite instance.
     * @type {THREE.Sprite}
     */
    this.sprite = new THREE.Sprite(this.material);
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
   * @param {object} json - The JSON to construct the instance from.
   * @param {Texture} json.loadedTexture - The loaded sprite texture
   * @param {object} json.materialProperties - The sprite material properties
   * @return {BodyTHREE.Sprite}
   */
  static fromJSON(json) {
    const {
      loadedTexture,
      materialProperties = getDefaultJsonMaterialProperties(),
      isEnabled = true,
    } = json;
    const SUPPORTED_MATERIAL_BLENDING_MODES = getSupportedMaterialBlendingModes();

    const ensureMappedBlendingMode = properties => {
      const { blending } = properties;

      return {
        ...properties,
        blending: blending
          ? SUPPORTED_MATERIAL_BLENDING_MODES[blending]
          : SUPPORTED_MATERIAL_BLENDING_MODES[
              getDefaultJsonMaterialProperties().blending
            ],
      };
    };

    return new Texture(
      loadedTexture,
      withDefaults(
        getDefaultJsonMaterialProperties(),
        ensureMappedBlendingMode(materialProperties)
      ),
      isEnabled
    );
  }
}
