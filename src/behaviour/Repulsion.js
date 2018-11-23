import Attraction from './Attraction';

export default class Repulsion extends Attraction {
  constructor(targetPosition, force, radius, life, easing) {
    super(targetPosition, force, radius, life, easing);

    this.force *= -1;
    this.name = 'Repulsion';
  }

  reset(targetPosition, force, radius, life, easing) {
    Repulsion._super_.prototype.reset.call(
      this,
      targetPosition,
      force,
      radius,
      life,
      easing
    );
    this.force *= -1;
  }
}
