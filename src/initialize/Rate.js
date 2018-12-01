import Initializer from './Initializer';
import Util from '../utils/Util';
import { createSpan } from '../math';

export default class Rate extends Initializer {
  /**
   * The number of particles per second emission (a [particle]/b [s]);
   * @class Proton.Rate
   * @constructor
   * @param {Array or Number or Proton.Span} numPan the number of each emission;
   * @param {Array or Number or Proton.Span} timePan the time of each emission;
   * for example: new Proton.Rate(new Proton.Span(10, 20), new Proton.Span(.1, .25));
   */
  constructor(numPan, timePan) {
    super();

    this.numPan = createSpan(Util.initValue(numPan, 1));
    this.timePan = createSpan(Util.initValue(timePan, 1));

    this.startTime = 0;
    this.nextTime = 0;
    this.init();
  }

  init() {
    this.startTime = 0;
    this.nextTime = this.timePan.getValue();
  }

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
