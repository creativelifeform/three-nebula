import { DEFAULT_RATE_NUM_PAN, DEFAULT_RATE_TIME_PAN } from './constants';
import { Span, createSpan } from '../math';

import Initializer from './Initializer';
import { INITIALIZER_TYPE_RATE as type } from './types';

/**
 * Calculates the rate of particle emission.
 *
 * TODO This doesn't need to be an initializer, it doesn't have an initialize
 * method, it overrides the base init method and it is only relevent to the Emitter class.
 * It would be better to move this to the Emitter module itself as a standalone class.
 *
 */
export default class Rate extends Initializer {
  /**
   * Constructs a Rate instance.
   *
   * @param {number|array|Span} numPan - The number of particles to emit
   * @param {number|array|Span} timePan - The time between each particle emission
   * @return void
   */
  constructor(numPan = DEFAULT_RATE_NUM_PAN, timePan = DEFAULT_RATE_TIME_PAN) {
    super(type);

    /**
     * @desc Sets the number of particles to emit.
     * @type {Span}
     */
    this.numPan = createSpan(numPan);

    /**
     * @desc Sets the time between each particle emission.
     * @type {Span}
     */
    this.timePan = createSpan(timePan);

    /**
     * @desc The rate's start time.
     * @type {number}
     */
    this.startTime = 0;

    /**
     * @desc The rate's next time.
     * @type {number}
     */
    this.nextTime = 0;

    this.init();
  }

  /**
   * Sets the startTime and nextTime properties.
   *
   * @return void
   */
  init() {
    this.startTime = 0;
    this.nextTime = this.timePan.getValue();
  }

  /**
   * Gets the number of particles to emit.
   *
   * @param {number} time - Current particle engine time
   * @return {number}
   */
  getValue(time) {
    this.startTime += time;

    if (this.startTime >= this.nextTime) {
      this.init();

      if (this.numPan.b == 1) {
        if (this.numPan.getValue('Float') > 0.5) return 1;
        else return 0;
      } else {
        return this.numPan.getValue('Int');
      }
    }

    return 0;
  }

  /**
   * Creates a Rate initializer from JSON.
   *
   * @param {object} json - The JSON to construct the instance from.
   * @property {number} json.particlesMin - The minimum number of particles to emit
   * @property {number} json.particlesMax - The maximum number of particles to emit
   * @property {number} json.perSecondMin - The minimum per second emit rate
   * @property {number} json.perSecondMax - The maximum per second emit rate
   * @return {Rate}
   */
  static fromJSON(json) {
    const { particlesMin, particlesMax, perSecondMin, perSecondMax } = json;

    return new Rate(
      new Span(particlesMin, particlesMax),
      new Span(perSecondMin, perSecondMax)
    );
  }
}
