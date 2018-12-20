import Initializer from './Initializer';
import { createArraySpan } from '../math';

/**
 * Sets the body property on initialized particles.
 *
 */
export default class Body extends Initializer {
  /**
   * Constructs a Body initalizer instance.
   *
   * @param {string|number|object} body - The content for the particle body, can
   * be a color or an object (mesh)
   * @param {?number} w - The width of the particle body
   * @param {?number} h - The height of the particle body
   * @return void
   */
  constructor(body, w, h) {
    super();

    /**
     * @desc The content for the particle body
     * @type {ArraySpan}
     */
    this.body = createArraySpan(body);

    /**
     * @desc The width of the particle Body
     * @type {number}
     */
    this.w = w;

    /**
     * @desc The height of the particle Body
     * @type {number}
     */
    this.h = h || w;
  }

  /**
   * Sets the particle's initial body.
   *
   * @param {Particle} particle - the particle to initialize the property on
   * @return void
   */
  initialize(particle) {
    var body = this.body.getValue();

    if (this.w) {
      particle.body = {
        width: this.w,
        height: this.h,
        body: body
      };
    } else {
      particle.body = body;
    }
  }

  /**
   * Creates a Body initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {number} json.body - The color for the particle body
   * @property {number} json.width - The width of the particle body
   * @property {number} json.height - The height of the particle body
   * @return {Body}
   */
  static fromJSON(json) {
    const { body, width, height } = json;

    return new Body(body, width, height);
  }
}
