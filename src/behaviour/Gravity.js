import Force from './Behaviour';

export default class Gravity extends Force {
  constructor(g, life, easing) {
    super(0, -g, 0, life, easing);
    this.name = 'Gravity';
  }

  reset(g, life, easing) {
    super.reset(0, -g, 0, life, easing);
  }
}

/**
 * Compatibility class.
 *
 * @deprecated
 */
export class G extends Gravity {
  constructor() {
    super(arguments);

    console.warn(
      'The G class is deprecated and will be removed in the future, please use Gravity instead'
    );
  }
}
