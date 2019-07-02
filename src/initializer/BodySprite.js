import {
  getDefaultJsonMaterialProperties,
  getDefaultMaterialProperties,
  getSupportedMaterialBlendingModes,
} from './constants';

import Initializer from './Initializer';
import { INITIALIZER_TYPE_BODY_SPRITE as type } from './types';
import { withDefaults } from '../utils';

/**
 * Sets the body property to be a THREE.THREE.Sprite on initialized particles.
 *
 * NOTE The texture map MUST be set on the THREE.SpriteMaterial in the THREE.TextureLoader.load
 * callback. Not doing so will cause WebGL buffer errors.
 */
export default class BodySprite extends Initializer {
  /**
   * Constructs a BodyTHREE.Sprite initializer.
   *
   * @param {object} THREE - The WebGL API to use
   * @param {string} texture - The sprite texture
   * @param {object} materialProperties - The sprite material properties
   * @throws {Error} If the THREE.TextureLoader fails to load the supplied texture
   * @return void
   */
  constructor(THREE, texture, materialProperties, isEnabled = true) {
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

    new THREE.TextureLoader().load(
      texture,
      map => {
        /**
         * @desc The texture for the THREE.THREE.SpriteMaterial map.
         * @type {Texture}
         */
        this.texture = map;

        /**
         * @desc THREE.THREE.SpriteMaterial instance.
         * @type {THREE.SpriteMaterial}
         */
        this.material = new THREE.SpriteMaterial({
          ...{ map },
          ...this.materialProperties,
        });

        /**
         * @desc THREE.THREE.Sprite instance.
         * @type {THREE.Sprite}
         */
        this.sprite = new THREE.Sprite(this.material);
      },
      undefined,
      error => {
        throw new Error(error);
      }
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

  /**
   * Ensures a WebGL API will be provided to the constructor and fromJSON methods.
   *
   * @return {boolean}
   */
  static requiresWebGlApi() {
    return true;
  }

  /**
   * Creates a BodyTHREE.Sprite initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @param {string} json.texture - The sprite texture
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
      texture,
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

    return new BodySprite(
      THREE,
      texture,
      withDefaults(
        DEFAULT_JSON_MATERIAL_PROPERTIES,
        ensureMappedBlendingMode(materialProperties)
      ),
      isEnabled
    );
  }
}
