import Initialize from './Initialize';
import Util from '../utils/Util';
import { createArraySpan } from '../math';

export default class Body extends Initialize {
  constructor(body, w, h) {
    super();

    this.body = createArraySpan(body);
    this.w = w;
    this.h = Util.initValue(h, this.w);
  }

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
}
