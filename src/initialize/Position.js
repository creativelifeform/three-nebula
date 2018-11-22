import Initialize from './Initialize';

export default class Position extends Initialize {
  /**
   * Position is init particle's Position
   * @param {Zone} zone - the Position zone
   * @example
   * var Position = new Proton.Position(new Proton.PointZone(30,100,0));
   * or
   * var Position = new Proton.Position(Infinity);
   * @extends {Proton.Initialize}
   * @constructor
   */
  constructor() {
    super();
    this.reset.apply(this, arguments);
  }

  reset() {
    if (!this.zones) this.zones = [];
    else this.zones.length = 0;

    var args = Array.prototype.slice.call(arguments);

    this.zones = this.zones.concat(args);
  }

  addZone() {
    var args = Array.prototype.slice.call(arguments);

    this.zones = this.zones.concat(args);
  }
}

Position.prototype.initialize = (function() {
  let zone;

  return function(target) {
    zone = this.zones[(Math.random() * this.zones.length) >> 0];

    zone.getPosition();

    target.p.x = zone.vector.x;
    target.p.y = zone.vector.y;
    target.p.z = zone.vector.z;
  };
})();
