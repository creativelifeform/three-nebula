import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  SYSTEM_UPDATE,
  SYSTEM_UPDATE_AFTER,
} from '../events';

import { DEFAULT_SYSTEM_DELTA } from './constants';
import Emitter from '../emitter/Emitter';
import { INTEGRATION_TYPE_EULER } from '../math/constants';
import { POOL_MAX } from '../constants';
import Pool from './Pool';
import fromJSON from './fromJSON';
import fromJSONAsync from './fromJSONAsync';
import { CORE_TYPE_SYSTEM as type } from './types';

/**
 * The core of the three-system particle engine.
 * A System instance can contain multiple emitters, each with their own initializers
 * and behaviours.
 *
 */
export default class System {
  /**
   * Constructs a System instance.
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
     * @desc A pool used to manage the internal system cache of objects
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
   * Creates a System instance from a JSON object.
   *
   * @param {object} json - The JSON to create the System instance from
   * @param {number} json.preParticles - The predetermined number of particles
   * @param {string} json.integrationType - The integration algorithm to use
   * @param {array<object>} json.emitters - The emitters for the system instance
   * @return {System}
   */
  static fromJSON(json) {
    return fromJSON(json, System, Emitter);
  }

  /**
   * Loads a System instance from JSON asynchronously. Ensures all textures are
   * fully loaded before resolving with the instantiated System instance.
   *
   * @param {object} json - The JSON to create the System instance from
   * @param {number} json.preParticles - The predetermined number of particles
   * @param {string} json.integrationType - The integration algorithm to use
   * @param {array<object>} json.emitters - The emitters for the system instance
   * @return {Promise<System>}
   */
  static fromJSONAsync(json) {
    return fromJSONAsync(json, System, Emitter);
  }

  /**
   * Proxy method for the internal event dispatcher's dispatchEvent method.
   *
   * @param {string} event - The event to dispatch
   * @param {object<System|Emitter|Particle>} [target=this] - The event target
   */
  dispatch(event, target = this) {
    this.eventDispatcher.dispatchEvent(event, target);
  }

  /**
   * Adds a renderer to the System instance and initializes it.
   *
   * @param {Renderer} renderer - The renderer to add
   * @return {System}
   */
  addRenderer(renderer) {
    this.renderers.push(renderer);
    renderer.init(this);

    return this;
  }

  /**
   * Removes a renderer from the System instance.
   *
   * @param {Renderer} renderer
   * @return {System}
   */
  removeRenderer(renderer) {
    this.renderers.splice(this.renderers.indexOf(renderer), 1);
    renderer.remove(this);

    return this;
  }

  /**
   * Adds an emitter to the System instance.
   * Dispatches the EMITTER_ADDED event.
   *
   * @param {Emitter} emitter - The emitter to add
   * @return {System}
   */
  addEmitter(emitter) {
    emitter.parent = this;

    this.emitters.push(emitter);
    this.dispatch(EMITTER_ADDED, emitter);

    return this;
  }

  /**
   * Removes an emitter from the System instance.
   * Dispatches the EMITTER_REMOVED event.
   *
   * @param {Emitter} emitter - The emitter to remove
   * @return {System}
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
   *   system.update();
   *   requestAnimationFrame(animate);
   * }
   * animate();
   *
   * @param {number} delta - Delta time
   * @return {Promise}
   */
  update(delta = DEFAULT_SYSTEM_DELTA) {
    const d = delta || DEFAULT_SYSTEM_DELTA;

    if (this.canUpdate) {
      this.dispatch(SYSTEM_UPDATE);

      if (d > 0) {
        let i = this.emitters.length;

        while (i--) {
          this.emitters[i].update(d);
        }
      }

      this.dispatch(SYSTEM_UPDATE_AFTER);
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
