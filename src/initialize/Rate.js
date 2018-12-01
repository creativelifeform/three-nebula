import Initializer from './Initializer';
import Util from '../utils/Util';
import { createSpan } from '../math';

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
  constructor(numPan, timePan) {
    super();

    /**
     * @desc Sets the number of particles to emit.
     * @type {Span}
     */
    this.numPan = createSpan(Util.initValue(numPan, 1));

    /**
     * @desc Sets the time between each particle emission.
     * @type {Span}
     */
    this.timePan = createSpan(Util.initValue(timePan, 1));

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
}
