import { DEFAULT_RATE_NUM_PAN, DEFAULT_RATE_TIME_PAN } from './constants';
import { Span, createSpan } from '../math';

import Initializer from './Initializer';
import { INITIALIZER_TYPE_RATE as type } from './types';

interface RateJSON {
  particlesMin?: number;
  particlesMax?: number;
  perSecondMin?: number;
  perSecondMax?: number;
}

/**
 * Calculates the rate of particle emission.
 *
 * NOTE This doesn't need to be an initializer, it doesn't have an initialize
 * method, it overrides the base init method and it is only relevent to the Emitter class.
 * It would be better to move this to the Emitter module itself as a standalone class.
 *
 */
export default class Rate extends Initializer {
  numPan: Span<number>;
  timePan: Span<number>;
  startTime: number;
  nextTime: number;

  /**
   * Constructs a Rate instance.
   *
   * @param numPan - The number of particles to emit
   * @param timePan - The time between each particle emission
   */
  constructor(
    numPan: number | number[] | Span = DEFAULT_RATE_NUM_PAN,
    timePan: number | number[] | Span = DEFAULT_RATE_TIME_PAN
  ) {
    super(type);

    /**
     * @desc Sets the number of particles to emit.
     */
    this.numPan = createSpan(numPan);

    /**
     * @desc Sets the time between each particle emission.
     */
    this.timePan = createSpan(timePan);

    /**
     * @desc The rate's start time.
     */
    this.startTime = 0;

    /**
     * @desc The rate's next time.
     */
    this.nextTime = 0;

    this.init();
  }

  /**
   * Sets the startTime and nextTime properties.
   */
  init(): void {
    this.startTime = 0;
    this.nextTime = this.timePan.getValue();
  }

  /**
   * Gets the number of particles to emit.
   *
   * @param time - Current particle engine time
   */
  getValue(time: number): number {
    this.startTime += time;

    if (this.startTime >= this.nextTime) {
      this.init();

      if (this.numPan.b == 1) {
        if (this.numPan.getValue(true) > 0.5) return 1;
        else return 0;
      } else {
        return this.numPan.getValue(true);
      }
    }

    return 0;
  }

  /**
   * Creates a Rate initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: RateJSON): Rate {
    const { particlesMin, particlesMax, perSecondMin, perSecondMax } = json;

    return new Rate(
      new Span(particlesMin, particlesMax),
      new Span(perSecondMin, perSecondMax)
    );
  }
}
