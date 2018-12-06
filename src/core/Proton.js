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
   * TODO the proton instance should have an integrator set as a property.
   * It is only required from the emitter class, and therefore can be accessed within
   * that class from emitter.parent.integrator
   *
   * @param {number} [preParticles=POOL_MAX] - The number of particles to start with
   * @param {string} [integrationType=EULER] - The integration type to use
   * @return void
   */
  constructor(preParticles = POOL_MAX, integrationType = EULER) {
    /**
     * @desc The number of particles to start with
     * @type {number}
     */
    this.preParticles = preParticles;

    /**
     * @desc The integration type to use
     * @param {string}
     */
    this.integrationType = integrationType;

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
   * Proxy method for the internal event dispatcher's dispatchEvent method.
   *
   * @param {string} event - The event to dispatch
   * @param {object<Proton|Emitter|Particle>} [target=this] - The event target
   */
  dispatch(event, target = this) {
    this.eventDispatcher.dispatchEvent(event, target);
  }

  /**
   * @deprecated Use addRenderer
   */
  addRender(renderer) {
    /* istanbul ignore next */
    this.renderers.push(renderer);
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    this.renderers.splice(this.renderers.indexOf(renderer), 1);
    /* istanbul ignore next */
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

    return this;
  }

  /**
   * Adds an emitter to the Proton instance.
   * Dispatches the EMITTER_ADDED event.
   *
   * @param {Emitter} emitter - The emitter to add
   * @return {Proton}
   */
  addEmitter(emitter) {
    emitter.parent = this;

    this.emitters.push(emitter);
    this.dispatch(EMITTER_ADDED, emitter);

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
    if (emitter.parent !== this) {
      return this;
    }

    emitter.parent = null;

    this.emitters.splice(this.emitters.indexOf(emitter), 1);
    this.dispatch(EMITTER_REMOVED, emitter);

    return this;
  }

  /**
   * Updates the particle system based on the delta passed.
   *
   * @example
   * animate = timestamp => {
   *   threeRenderer.render(threeScene, threeCamera);
   *   proton.update();
   *   requestAnimationFrame(animate);
   * }
   * animate();
   *
   * @param {number}
   * @return {Promise}
   */
  update(delta = DEFAULT_PROTON_DELTA) {
    const d = delta || DEFAULT_PROTON_DELTA;

    this.dispatch(PROTON_UPDATE);

    if (d > 0) {
      let i = this.emitters.length;

      while (i--) {
        this.emitters[i].update(d);
      }
    }

    this.dispatch(PROTON_UPDATE_AFTER);

    return Promise.resolve();
  }

  /**
   * Gets a count of the total number of particles in the system.
   *
   * @return {integer}
   */
  getCount() {
    const length = this.emitters.length;
    let total = 0;
    let i;

    for (i = 0; i < length; i++) {
      total += this.emitters[i].particles.length;
    }

    return total;
  }

  /**
   * Destroys all emitters and the Proton pool.
   *
   * @return void
   */
  destroy() {
    const length = this.emitters.length;
    let i = 0;

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
