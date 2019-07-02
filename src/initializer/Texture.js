import {
  getDefaultJsonMaterialProperties,
  getDefaultMaterialProperties,
  getSupportedMaterialBlendingModes,
} from './constants';

import Initializer from './Initializer';
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
  constructor(THREE, loadedTexture, materialProperties, isEnabled = true) {
    super(type, isEnabled);

    const DEFAULT_MATERIAL_PROPERTIES = getDefaultMaterialProperties(THREE);

    /**
     * @desc The material properties for this object's THREE.SpriteMaterial
     * NOTE This is required for testing purposes
     * @type {object}
     */
    this.materialProperties = withDefaults(
      DEFAULT_MATERIAL_PROPERTIES,
      materialProperties || DEFAULT_MATERIAL_PROPERTIES
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
   * Ensures a WebGL API will be provided to the constructor and fromJSON methods.
   *
   * @return {boolean}
   */
  static requiresWebGlApi() {
    return true;
  }

  /**
   * Creates a Texture initializer from JSON.
   *
   * @param {object} THREE - The Web GL API to use
   * @param {object} json - The JSON to construct the instance from.
   * @param {Texture} json.loadedTexture - The loaded sprite texture
   * @param {object} json.materialProperties - The sprite material properties
   * @return {BodyTHREE.Sprite}
   */
  static fromJSON(THREE, json) {
    const DEFAULT_JSON_MATERIAL_PROPERTIES = getDefaultJsonMaterialProperties(
      THREE
    );
    const SUPPORTED_MATERIAL_BLENDING_MODES = getSupportedMaterialBlendingModes(
      THREE
    );
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
      loadedTexture,
      withDefaults(
        DEFAULT_JSON_MATERIAL_PROPERTIES,
        ensureMappedBlendingMode(materialProperties)
      ),
      isEnabled
    );
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
}
