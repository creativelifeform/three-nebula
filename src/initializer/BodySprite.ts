import {
  DEFAULT_JSON_MATERIAL_PROPERTIES,
  DEFAULT_MATERIAL_PROPERTIES,
  SUPPORTED_MATERIAL_BLENDING_MODES,
} from './constants';

import Initializer from './Initializer';
import { INITIALIZER_TYPE_BODY_SPRITE as type } from './types';
import { withDefaults } from '../utils';
import type {
  Sprite,
  SpriteMaterial,
  Texture as ThreeTexture,
} from 'three';
import type Particle from '../core/Particle';

interface BodySpriteJSON {
  texture?: string;
  materialProperties?: Record<string, unknown>;
  isEnabled?: boolean;
}

/**
 * Sets the body property to be a THREE.Sprite on initialized particles.
 *
 * NOTE The texture map MUST be set on the SpriteMaterial in the TextureLoader.load
 * callback. Not doing so will cause WebGL buffer errors.
 */
export default class BodySprite extends Initializer {
  materialProperties: Record<string, unknown>;
  texture: ThreeTexture;
  material: SpriteMaterial;
  sprite: Sprite;

  /**
   * Constructs a BodySprite initializer.
   *
   * @param THREE - The Web GL API we are using eg., THREE
   * @param texture - The sprite texture
   * @param materialProperties - The sprite material properties
   * @throws {Error} If the TextureLoader fails to load the supplied texture
   */
  constructor(
    THREE: typeof import('three'),
    texture: string,
    materialProperties: Record<string, unknown> = DEFAULT_MATERIAL_PROPERTIES,
    isEnabled: boolean = true
  ) {
    super(type, isEnabled);

    const { Sprite, SpriteMaterial, TextureLoader } = THREE;

    /**
     * @desc The material properties for this object's SpriteMaterial
     * NOTE This is required for testing purposes
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
         */
        this.texture = map;

        /**
         * @desc THREE.SpriteMaterial instance.
         */
        this.material = new SpriteMaterial({
          ...{ map },
          ...this.materialProperties,
        });

        /**
         * @desc THREE.Sprite instance.
         */
        this.sprite = new Sprite(this.material);
      },
      undefined,
      error => {
        throw new Error(error as string);
      }
    );
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
   * Creates a BodySprite initializer from JSON.
   *
   * @param json - The JSON to construct the instance from
   * @param THREE - The Web GL API we are using eg., THREE
   */
  static fromJSON(
    json: BodySpriteJSON,
    THREE: typeof import('three')
  ): BodySprite {
    const {
      texture,
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
