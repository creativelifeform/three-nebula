import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  PROTON_UPDATE,
  PROTON_UPDATE_AFTER,
} from '../events';

import { DEFAULT_PROTON_DELTA } from './constants';
import Emitter from '../emitter/Emitter';
import { INTEGRATION_TYPE_EULER } from '../math/constants';
import { POOL_MAX } from '../constants';
import Pool from './Pool';
import fromJSON from './fromJSON';
import fromJSONAsync from './fromJSONAsync';
import { CORE_TYPE_PROTON as type } from './types';

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
   * @param {string} [integrationType=INTEGRATION_TYPE_EULER] - The integration type to use
   * @return void
   */
  constructor(
    preParticles = POOL_MAX,
    integrationType = INTEGRATION_TYPE_EULER
  ) {
    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;

    /**
     * @desc Determines if the system can update or not. Set to false when destroying
     * to ensure that external calls to update do not throw errors.
     * @type {boolean}
     */
    this.canUpdate = true;

    /**
     * @desc The number of particles to start with.
     * @type {number}
     */
    this.preParticles = preParticles;

    /**
     * @desc The integration algorithm type to use.
     * @param {string}
     */
    this.integrationType = integrationType;

    /**
     * @desc The emitters in the particle system.
     * @type {array<Emitter>}
     */
    this.emitters = [];

    /**
     * @desc The renderers for the system.
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
   * Creates a Proton instance from a JSON object.
   *
   * @param {object} json - The JSON to create the Proton instance from
   * @param {number} json.preParticles - The predetermined number of particles
   * @param {string} json.integrationType - The integration algorithm to use
   * @param {array<object>} json.emitters - The emitters for the proton instance
   * @return {Proton}
   */
  static fromJSON(json) {
    return fromJSON(json, Proton, Emitter);
  }

  /**
   * Loads a Proton instance from JSON asynchronously. Ensures all textures are
   * fully loaded before resolving with the instantiated Proton instance.
   *
   * @param {object} json - The JSON to create the Proton instance from
   * @param {number} json.preParticles - The predetermined number of particles
   * @param {string} json.integrationType - The integration algorithm to use
   * @param {array<object>} json.emitters - The emitters for the proton instance
   * @return {Promise<Proton>}
   */
  static fromJSONAsync(json) {
    return fromJSONAsync(json, Proton, Emitter);
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
   * animate = () => {
   *   threeRenderer.render(threeScene, threeCamera);
   *   proton.update();
   *   requestAnimationFrame(animate);
   * }
   * animate();
   *
   * @param {number} delta - Delta time
   * @return {Promise}
   */
  update(delta = DEFAULT_PROTON_DELTA) {
    const d = delta || DEFAULT_PROTON_DELTA;

    if (this.canUpdate) {
      this.dispatch(PROTON_UPDATE);

      if (d > 0) {
        let i = this.emitters.length;

        while (i--) {
          this.emitters[i].update(d);
        }
      }

      this.dispatch(PROTON_UPDATE_AFTER);
    }

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
   * Ensures that this.update will not perform any operations while the system
   * is being destroyed.
   *
   * @return void
   */
  destroy() {
    const length = this.emitters.length;

    this.canUpdate = false;

    for (let i = 0; i < length; i++) {
      this.emitters[i] && this.emitters[i].destroy();
      delete this.emitters[i];
    }

    this.emitters.length = 0;
    this.pool.destroy();
    this.canUpdate = true;
  }
}
