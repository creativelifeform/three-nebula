import * as THREE from 'three';

import {
  DEFAULT_JSON_MATERIAL_PROPERTIES,
  DEFAULT_MATERIAL_PROPERTIES,
} from './constants';

import Initializer from './Initializer';
import { INITIALIZER_TYPE_BODY_SPRITE as type } from './types';
import { withDefaults } from '../utils';

const { Sprite, SpriteMaterial, TextureLoader } = THREE;

/**
 * Sets the body property to be a THREE.Sprite on initialized particles.
 *
 * NOTE The texture map MUST be set on the SpriteMaterial in the TextureLoader.load
 * callback. Not doing so will cause WebGL buffer errors.
 */
export default class BodySprite extends Initializer {
  /**
   * Constructs a BodySprite initializer.
   *
   * @param {string} texture - The sprite texture
   * @param {object} materialProperties - The sprite material properties
   * @throws {Error} If the TextureLoader fails to load the supplied texture
   * @return void
   */
  constructor(
    texture,
    materialProperties = DEFAULT_MATERIAL_PROPERTIES,
    isEnabled = true
  ) {
    super(type, isEnabled);

    /**
     * @desc The material properties for this object's SpriteMaterial
     * NOTE This is required for testing purposes
     * @type {object}
     */
    this.materialProperties = withDefaults(
      DEFAULT_MATERIAL_PROPERTIES,
      materialProperties
    );

    new TextureLoader().load(
      texture,
      map => {
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
          ...this.materialProperties,
        });

        /**
         * @desc THREE.Sprite instance.
         * @type {Sprite}
         */
        this.sprite = new Sprite(this.material);
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
   * Creates a BodySprite initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @param {string} json.texture - The sprite texture
   * @param {object} json.materialProperties - The sprite material properties
   * @return {BodySprite}
   */
  static fromJSON(json) {
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
          ? THREE[blending]
          : THREE[DEFAULT_JSON_MATERIAL_PROPERTIES.blending],
      };
    };

    return new BodySprite(
      texture,
      withDefaults(
        DEFAULT_JSON_MATERIAL_PROPERTIES,
        ensureMappedBlendingMode(materialProperties)
      ),
      isEnabled
    );
  }
}
