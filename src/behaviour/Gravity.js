import Force from './Behaviour';

export default class Gravity extends Force {
  constructor(g, life, easing) {
    super(0, -g, 0, life, easing);
    this.name = 'Gravity';
  }

  reset(g, life, easing) {
    Gravity._super_.prototype.reset.call(this, 0, -g, 0, life, easing);
  }
}
