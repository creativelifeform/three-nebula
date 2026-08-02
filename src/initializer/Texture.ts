import {
  DEFAULT_JSON_MATERIAL_PROPERTIES,
  DEFAULT_MATERIAL_PROPERTIES,
  SUPPORTED_MATERIAL_BLENDING_MODES,
} from './constants';

import Initializer from './Initializer';
import { INITIALIZER_TYPE_TEXTURE as type } from './types';
import { withDefaults } from '../utils';
import type { Sprite, SpriteMaterial, Texture as ThreeTexture } from 'three';
import type Particle from '../core/Particle';

interface TextureJSON {
  loadedTexture?: ThreeTexture;
  materialProperties?: Record<string, unknown>;
  isEnabled?: boolean;
}

/**
 * Sets the body property to be a THREE.Sprite with a texture map on initialized particles.
 *
 */
export default class Texture extends Initializer {
  materialProperties: Record<string, unknown>;
  texture?: ThreeTexture;
  material: SpriteMaterial;
  sprite: Sprite;

  /**
   * Constructs an Texture initializer.
   *
   * @param THREE - The Web GL API we are using eg., THREE
   * @param loadedTexture - Preloaded THREE.Texture instance
   * @param materialProperties - The sprite material properties
   */
  constructor(
    THREE: typeof import('three'),
    loadedTexture?: ThreeTexture,
    materialProperties: Record<string, unknown> = DEFAULT_MATERIAL_PROPERTIES,
    isEnabled: boolean = true
  ) {
    super(type, isEnabled);

    const { Sprite, SpriteMaterial } = THREE;

    /**
     * @desc The material properties for this object's SpriteMaterial
     * NOTE This is required for testing purposes
     */
    this.materialProperties = withDefaults(
      DEFAULT_MATERIAL_PROPERTIES,
      materialProperties
    );

    /**
     * @desc The texture for the THREE.SpriteMaterial map.
     */
    this.texture = loadedTexture;

    /**
     * @desc THREE.SpriteMaterial instance.
     */
    this.material = new SpriteMaterial({
      ...{ map: loadedTexture },
      ...this.materialProperties,
    });

    /**
     * @desc THREE.Sprite instance.
     */
    this.sprite = new Sprite(this.material);
  }

  /**
   * Sets the particle body to the sprite.
   *
   * @param particle - The particle to set the body of
   */
  initialize(particle: Particle): void {
    particle.body = this.sprite;
  }

  /**
   * Creates a Texture initializer from JSON.
   *
   * @param json - The JSON to construct the instance from
   * @param THREE - The Web GL API we are using eg., THREE
   */
  static fromJSON(json: TextureJSON, THREE: typeof import('three')): Texture {
    const {
      loadedTexture,
      materialProperties = DEFAULT_JSON_MATERIAL_PROPERTIES,
      isEnabled = true,
    } = json;

    const ensureMappedBlendingMode = (
      properties: Record<string, unknown>
    ): Record<string, unknown> => {
      const { blending } = properties;

      return {
        ...properties,
        blending: blending
          ? SUPPORTED_MATERIAL_BLENDING_MODES[
              blending as keyof typeof SUPPORTED_MATERIAL_BLENDING_MODES
            ]
          : SUPPORTED_MATERIAL_BLENDING_MODES[
              DEFAULT_JSON_MATERIAL_PROPERTIES.blending as keyof typeof SUPPORTED_MATERIAL_BLENDING_MODES
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
