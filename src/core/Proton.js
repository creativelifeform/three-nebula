import { EULER, POOL_MAX } from '../constants';
import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  PROTON_UPDATE,
  PROTON_UPDATE_AFTER
} from '../events';

import { DEFAULT_PROTON_DELTA } from './constants';
import Integration from '../math/Integration';
import Pool from './Pool';
import { Util } from '../utils';

/**
 * The core of the three-proton particle engine.
 * A Proton instance can contain multiple emitters, each with their own initializers
 * and behaviours.
 *
 */
export default class Proton {
  /**
   * Constructs a Proton instance.
   *
   * @param {number} [preParticles=POOL_MAX] - The number of particles to start with
   * @param {string} [integrationType=EULER] - The integration type to use
   * @return void
   */
  constructor(preParticles, integrationType) {
    /**
     * @desc The number of particles to start with
     * @type {number}
     */
    this.preParticles = Util.initValue(preParticles, POOL_MAX);

    /**
     * @desc The integration type to use
     * @param {string}
     */
    this.integrationType = Util.initValue(integrationType, EULER);

    /**
     * @desc The emitters in the particle system
     * @type {array<Emitter>}
     */
    this.emitters = [];

    /**
     * @desc The renderers for the system
     * @type {array<Renderer>}
     */
    this.renderers = [];

    /**
     * @desc A pool used to manage the internal proton cache of objects
     * @type {Pool}
     */
    this.pool = new Pool();

    /**
     * @desc Internal event dispatcher
     * @type {EventDispatcher}
     */
    this.eventDispatcher = new EventDispatcher();
  }

  /**
   * Returns a new Integration instance based on the type passed to the constructor.
   *
   * @static
   * @return {Integration}
   */
  static integrator() {
    return new Integration(this.integrationType);
  }

  /**
   * @deprecated Use addRenderer
   */
  addRender(renderer) {
    this.renderers.push(renderer);
    renderer.init(this);
  }

  /**
   * Adds a renderer to the Proton instance and initializes it.
   *
   * @param {Renderer} renderer - The renderer to add
   * @return {Proton}
   */
  addRenderer(renderer) {
    this.renderers.push(renderer);
    renderer.init(this);

    return this;
  }

  /**
   * @deprecated Use removeRenderer
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
   * Adds an emitter to the Proton instance.
   * Dispatches the EMITTER_ADDED event.
   *
   * @param {Emitter} emitter - The emitter to add
   * @return {Proton}
   */
  addEmitter(emitter) {
    this.emitters.push(emitter);
    emitter.parent = this;
    this.eventDispatcher.dispatchEvent(EMITTER_ADDED, emitter);

    return this;
  }

  /**
   * Removes an emitter from the Proton instance.
   * Dispatches the EMITTER_REMOVED event.
   *
   * @param {Emitter} emitter - The emitter to remove
   * @return {Proton}
   */
  removeEmitter(emitter) {
    if (emitter.parent != this) return;

    this.emitters.splice(this.emitters.indexOf(emitter), 1);
    emitter.parent = null;
    this.eventDispatcher.dispatchEvent(EMITTER_REMOVED, emitter);

    return this;
  }

  /**
   * Updates the particle system based on the delta passed.
   *
   * @param {number}
   */
  update(delta = DEFAULT_PROTON_DELTA) {
    this.eventDispatcher.dispatchEvent(PROTON_UPDATE, this);

    const d = delta || DEFAULT_PROTON_DELTA;

    if (d > 0) {
      var i = this.emitters.length;

      while (i--) this.emitters[i].update(d);
    }

    this.eventDispatcher.dispatchEvent(PROTON_UPDATE_AFTER, this);
  }

  /**
   * Gets a count of the total number of particles in the system.
   *
   * @return {integer}
   */
  getCount() {
    var total = 0;
    var i,
      length = this.emitters.length;

    for (i = 0; i < length; i++) total += this.emitters[i].particles.length;

    return total;
  }

  /**
   * Destroys all emitters and the Proton pool.
   *
   * @return void
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

/**
 * @desc The system's integrator
 * @type {Integrator}
 */
export const integrator = Proton.integrator();
