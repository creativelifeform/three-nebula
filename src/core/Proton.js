import { EULER, POOL_MAX } from '../constants';
import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  PROTON_UPDATE,
  PROTON_UPDATE_AFTER
} from '../events';

import Integration from '../math/Integration';
import Pool from './Pool';
import { Util } from '../utils';

export default class Proton {
  /**
   * @name Proton is a particle engine for three.js
   *
   * @class Proton
   * @param {number} preParticles input any number
   * @param {number} integrationType input any number
   * @example var proton = new Proton(200);
   */
  constructor(preParticles, integrationType) {
    this.preParticles = Util.initValue(preParticles, POOL_MAX);
    this.integrationType = Util.initValue(integrationType, EULER);
    this.emitters = [];
    this.renderers = [];
    this.pool = new Pool();
    this.eventDispatcher = new EventDispatcher();
  }

  static integrator() {
    return new Integration(this.integrationType);
  }

  /**
   * @name add a type of Renderer
   *
   * @method addRender
   * @param {Renderer} render
   */
  addRender(renderer) {
    this.renderers.push(renderer);
    renderer.init(this);
  }

  /**
   * Adds a renderer to the Proton instance.
   *
   * @param {Renderer} renderer
   * @return {Proton}
   */
  addRenderer(renderer) {
    this.renderers.push(renderer);
    renderer.init(this);

    return this;
  }

  /**
   * @name add a type of Renderer
   *
   * @method addRender
   * @param {Renderer} render
   */
  removeRender(renderer) {
    this.renderers.splice(this.renderers.indexOf(renderer), 1);
    renderer.remove(this);
  }

  /**
   * Removes a renderer from the Proton instance.
   *
   * @param {Renderer} renderer
   * @return {Proton}
   */
  removeRenderer(renderer) {
    this.renderers.splice(this.renderers.indexOf(renderer), 1);
    renderer.remove(this);
  }

  /**
   * add the Emitter
   *
   * @method addEmitter
   * @param {Emitter} emitter
   * @return {Proton}
   */
  addEmitter(emitter) {
    this.emitters.push(emitter);
    emitter.parent = this;
    this.eventDispatcher.dispatchEvent(EMITTER_ADDED, emitter);

    return this;
  }

  removeEmitter(emitter) {
    if (emitter.parent != this) return;

    this.emitters.splice(this.emitters.indexOf(emitter), 1);
    emitter.parent = null;
    this.eventDispatcher.dispatchEvent(EMITTER_REMOVED, emitter);
  }

  update($delta) {
    this.eventDispatcher.dispatchEvent(PROTON_UPDATE, this);

    var delta = $delta || 0.0167;

    if (delta > 0) {
      var i = this.emitters.length;

      while (i--) this.emitters[i].update(delta);
    }

    this.eventDispatcher.dispatchEvent(PROTON_UPDATE_AFTER, this);
  }

  /**
   * getCount
   * @name get the count of particle
   * @return (number) particles count
   */
  getCount() {
    var total = 0;
    var i,
      length = this.emitters.length;

    for (i = 0; i < length; i++) total += this.emitters[i].particles.length;

    return total;
  }

  /**
   * destroy
   * @name destroy the proton
   */
  destroy() {
    var i = 0,
      length = this.emitters.length;

    for (i; i < length; i++) {
      this.emitters[i].destroy();
      delete this.emitters[i];
    }

    this.emitters.length = 0;
    this.pool.destroy();
  }
}

export const integrator = Proton.integrator();
