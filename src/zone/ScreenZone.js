import THREEUtil from '../utils/THREEUtil';
import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import { ZONE_TYPE_SCREEN as type } from './types';

export default class ScreenZone extends Zone {
  /**
   * ScreenZone is a 3d line zone
   * @param {Number|Vector3D} x1 - the line's start point of x value or a Vector3D Object
   * @param {Number|Vector3D} y1 - the line's start point of y value or a Vector3D Object
   * @param {Number} z1 - the line's start point of z value
   * @param {Number} x2 - the line's end point of x value
   * @param {Number} y2 - the line's end point of y value
   * @param {Number} z2 - the line's end point of z value
   * @example
   * var lineZone = new ScreenZone(0,0,0,100,100,0);
   * or
   * var lineZone = new ScreenZone(new Vector3D(0,0,0),new Vector3D(100,100,0));
   * @extends {Zone}
   * @constructor
   */
  constructor(camera, renderer, dis, dir) {
    super(type);

    this.camera = camera;
    this.renderer = renderer;
    this.dis = dis || 20;
    dir = dir || '1234';

    for (var i = 1; i < 5; i++) this['d' + i] = dir.indexOf(i + '') >= 0;
  }

  /**
   * Returns true to indicate this is a ScreenZone.
   *
   * @return {boolean}
   */
  isScreenZone() {
    return true;
  }

  _dead(particle) {
    var pos = THREEUtil.toScreenPos(
      particle.position,
      this.camera,
      this.renderer.domElement
    );
    var canvas = this.renderer.domElement;

    if (pos.y + particle.radius < -this.dis && this.d1) {
      particle.dead = true;
    } else if (pos.y - particle.radius > canvas.height + this.dis && this.d3) {
      particle.dead = true;
    }

    if (pos.x + particle.radius < -this.dis && this.d4) {
      particle.dead = true;
    } else if (pos.x - particle.radius > canvas.width + this.dis && this.d2) {
      particle.dead = true;
    }
  }

  _bound(particle) {
    var pos = THREEUtil.toScreenPos(
      particle.position,
      this.camera,
      this.renderer.domElement
    );
    var canvas = this.renderer.domElement;

    if (pos.y + particle.radius < -this.dis) {
      particle.velocity.y *= -1;
    } else if (pos.y - particle.radius > canvas.height + this.dis) {
      particle.velocity.y *= -1;
    }

    if (pos.x + particle.radius < -this.dis) {
      particle.velocity.y *= -1;
    } else if (pos.x - particle.radius > canvas.width + this.dis) {
      particle.velocity.y *= -1;
    }
  }
}

ScreenZone.prototype.getPosition = (function() {
  var vec2 = new Vector3D(),
    canvas;

  return function() {
    canvas = this.renderer.domElement;
    vec2.x = Math.random() * canvas.width;
    vec2.y = Math.random() * canvas.height;
    this.vector.copy(THREEUtil.toSpacePos(vec2, this.camera, canvas));

    return this.vector;
  };
})();

ScreenZone.prototype._cross = (function() {
  var vec2 = new Vector3D();

  return function(particle) {
    var pos = THREEUtil.toScreenPos(
      particle.position,
      this.camera,
      this.renderer.domElement
    );
    var canvas = this.renderer.domElement;

    if (pos.y + particle.radius < -this.dis) {
      vec2.x = pos.x;
      vec2.y = canvas.height + this.dis + particle.radius;
      particle.position.y = THREEUtil.toSpacePos(vec2, this.camera, canvas).y;
    } else if (pos.y - particle.radius > canvas.height + this.dis) {
      vec2.x = pos.x;
      vec2.y = -this.dis - particle.radius;
      particle.position.y = THREEUtil.toSpacePos(vec2, this.camera, canvas).y;
    }

    if (pos.x + particle.radius < -this.dis) {
      vec2.y = pos.y;
      vec2.x = canvas.width + this.dis + particle.radius;
      particle.position.x = THREEUtil.toSpacePos(vec2, this.camera, canvas).x;
    } else if (pos.x - particle.radius > canvas.width + this.dis) {
      vec2.y = pos.y;
      vec2.x = -this.dis - particle.radius;
      particle.position.x = THREEUtil.toSpacePos(vec2, this.camera, canvas).x;
    }
  };
})();
