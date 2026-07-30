import Emitter from './Emitter';
import THREEUtil from '../utils/THREEUtil';
import Util from '../utils/Util';
import { EMITTER_TYPE_FOLLOW as type } from './types';
import type { Camera } from 'three';

// `layerX`/`layerY` are non-standard MouseEvent properties not present in the
// DOM lib types.
interface LayerMouseEvent extends MouseEvent {
  layerX: number;
  layerY: number;
}

export default class FollowEmitter extends Emitter {
  mouseTarget: EventTarget;
  ease: number;
  _allowEmitting: boolean;
  mousemoveHandler: (e: Event) => void;
  camera: Camera;
  canvas: HTMLCanvasElement;

  /**
   * The FollowEmitter will emit particles when the mouse moves.
   */
  constructor(
    mouseTarget?: EventTarget,
    ease?: number,
    pObj?: Record<string, unknown>
  ) {
    super(pObj);

    this.type = type;
    this.mouseTarget = Util.initValue<EventTarget>(mouseTarget, window);
    this.ease = Util.initValue(ease, 0.7);
    this._allowEmitting = false;
    this.initEventHandler();
  }

  initEventHandler(): void {
    var self = this;

    this.mousemoveHandler = function (e: Event) {
      self.mousemove.call(self, e as MouseEvent);
    };

    this.mouseTarget.addEventListener(
      'mousemove',
      this.mousemoveHandler,
      false
    );
  }

  /**
   * Start emitting particles.
   */
  emit(): this {
    this._allowEmitting = true;

    return this;
  }

  /**
   * Stop emitting particles.
   */
  stopEmit(): void {
    this._allowEmitting = false;
  }

  setCameraAndCanvas(camera: Camera, canvas: HTMLCanvasElement): void {
    this.camera = camera;
    this.canvas = canvas;
  }

  mousemove(e: MouseEvent): void {
    const le = e as LayerMouseEvent;

    if (le.layerX || le.layerX == 0) {
      this.position.x += (le.layerX - this.position.x) * this.ease;
      this.position.y += (le.layerY - this.position.y) * this.ease;
    } else if (e.offsetX || e.offsetX == 0) {
      this.position.x += (e.offsetX - this.position.x) * this.ease;
      this.position.y += (e.offsetY - this.position.y) * this.ease;
    }

    this.position.copy(
      THREEUtil.toSpacePos(this.position, this.camera, this.canvas)
    );

    if (this._allowEmitting) super.emit('once' as unknown as number);
  }

  /**
   * Destroy this Emitter.
   */
  destroy(): void {
    super.destroy();
    this.mouseTarget.removeEventListener(
      'mousemove',
      this.mousemoveHandler,
      false
    );
  }
}
