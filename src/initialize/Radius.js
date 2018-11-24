import Initialize from './Initialize';
import { createSpan } from '../math';

export default class Radius extends Initialize {
  /**
   * Radius is init particle's Radius
   * @param {Number} a - the Radius's start point
   * @param {Number} b - the Radius's end point
   * @param {String} c - span's center
   * @example
   * var Radius = new Proton.Radius(3,5);
   * or
   * var Radius = new Proton.Radius(3,1,"center");
   * @extends {Initialize}
   * @constructor
   */
  constructor(a, b, c) {
    super();
    this.radius = createSpan(a, b, c);
  }

  reset(a, b, c) {
    this.radius = createSpan(a, b, c);
  }

  initialize(particle) {
    particle.radius = this.radius.getValue();
    particle.transform.oldRadius = particle.radius;
  }
}
