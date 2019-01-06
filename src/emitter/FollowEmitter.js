import Emitter from './Emitter';
import THREEUtil from '../utils/THREEUtil';
import Util from '../utils/Util';
import { EMITTER_TYPE_FOLLOW as type } from './types';

export default class FollowEmitter extends Emitter {
  /**
   * The FollowEmitter class inherits from Proton.Emitter
   *
   * use the FollowEmitter will emit particle when mousemoving
   *
   * @class Proton.FollowEmitter
   * @constructor
   * @param {Element} mouseTarget mouseevent's target;
   * @param {Number} ease the easing of following speed;
   * @default 0.7
   * @param {Object} pObj the parameters object;
   */
  constructor(mouseTarget, ease, pObj) {
    super(pObj);

    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
    this.mouseTarget = Util.initValue(mouseTarget, window);
    this.ease = Util.initValue(ease, 0.7);
    this._allowEmitting = false;
    this.initEventHandler();
  }

  initEventHandler() {
    var self = this;

    this.mousemoveHandler = function(e) {
      self.mousemove.call(self, e);
    };

    this.mousedownHandler = function(e) {
      self.mousedown.call(self, e);
    };

    this.mouseupHandler = function(e) {
      self.mouseup.call(self, e);
    };

    this.mouseTarget.addEventListener(
      'mousemove',
      this.mousemoveHandler,
      false
    );
  }

  /**
   * start emit particle
   * @method emit
   */
  emit() {
    this._allowEmitting = true;
  }

  /**
   * stop emiting
   * @method stopEmit
   */
  stopEmit() {
    this._allowEmitting = false;
  }

  setCameraAndCanvas(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
  }

  mousemove(e) {
    if (e.layerX || e.layerX == 0) {
      this.position.x += (e.layerX - this.position.x) * this.ease;
      this.position.y += (e.layerY - this.position.y) * this.ease;
    } else if (e.offsetX || e.offsetX == 0) {
      this.position.x += (e.offsetX - this.position.x) * this.ease;
      this.position.y += (e.offsetY - this.position.y) * this.ease;
    }

    this.position.copy(THREEUtil.toSpacePos(this.position, this.camera, this.canvas));

    if (this._allowEmitting) super.emit('once');
  }

  /**
   * Destory this Emitter
   * @method destroy
   */
  destroy() {
    super.destroy();
    this.mouseTarget.removeEventListener(
      'mousemove',
      this.mousemoveHandler,
      false
    );
  }
}
