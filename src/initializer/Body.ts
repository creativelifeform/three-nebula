import Initializer from './Initializer';
import { ArraySpan, createArraySpan } from '../math';
import { INITIALIZER_TYPE_BODY as type } from './types';
import type Particle from '../core/Particle';

interface BodyJSON {
  body?: unknown;
  width?: number;
  height?: number;
  isEnabled?: boolean;
}

/**
 * Sets the body property on initialized particles.
 *
 */
export default class Body extends Initializer {
  body: ArraySpan;
  w: number;
  h: number;

  /**
   * Constructs a Body initalizer instance.
   *
   * @param body - The content for the particle body, can
   * be a color or an object (mesh)
   * @param w - The width of the particle body
   * @param h - The height of the particle body
   */
  constructor(body: unknown, w?: number, h?: number, isEnabled: boolean = true) {
    super(type, isEnabled);

    /**
     * @desc The content for the particle body
     */
    this.body = createArraySpan(body);

    /**
     * @desc The width of the particle Body
     */
    this.w = w;

    /**
     * @desc The height of the particle Body
     */
    this.h = h || w;
  }

  /**
   * Sets the particle's initial body.
   *
   * @param particle - the particle to initialize the property on
   */
  initialize(particle: Particle): void {
    const body = this.body.getValue();

    if (this.w) {
      particle.body = {
        width: this.w,
        height: this.h,
        body: body,
      };
    } else {
      particle.body = body;
    }
  }

  /**
   * Creates a Body initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: BodyJSON): Body {
    const { body, width, height, isEnabled = true } = json;

    return new Body(body, width, height, isEnabled);
  }
}
