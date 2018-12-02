import { Util, uid } from '../utils';
import { ease, setEasingByName } from '../ease';

import { PI } from '../constants';
import { Vector3D } from '../math';

/**
 * A Particle is an object that is emitted by an emitter.
 *
 */
export default class Particle {
  /**
   * Constructs a Particle instance.
   *
   * @param {object} properties - The properties to instantiate the particle with
   * @property {number} properties.life - The particle's life
   * @property {number} properties.age - The particle's age
   * @property {number} properties.energy - The particle's energy loss
   * @property {boolean} properties.dead - Determines if the particle is dead or not
   * @property {boolean} properties.sleep - Determines if the particle is sleeping or not
   * @property {object} properties.target - The particle's target
   * @property {object} properties.body - The particle's body
   * @property {number} properties.mass - The particle's mass
   * @property {number} properties.radius - The particle's radius
   * @property {number} properties.alpha - The particle's alpha
   * @property {number} properties.scale - The particle's scale
   * @property {number} properties.rotation - The particle's rotation
   * @property {string|number} properties.color - The particle's color
   * @property {function} properties.easing - The particle's easing
   * @property {Vector3D} properties.p - The particle's position
   * @property {Vector3D} properties.v - The particle's velocity
   * @property {Vector3D} properties.a - The particle's acceleration
   * @property {array} properties.behaviours - The particle's behaviours array
   * @property {object} properties.transform - The particle's transform collection
   * @return void
   */
  constructor(properties) {
    /**
     * @desc The particle's unique id
     * @type {number}
     */
    this.id = `particle-${uid()}`;
    this.name = 'Particle';
    /**
     * @desc The particle's life
     * @type {number}
     */
    this.life = Infinity;
    /**
     * @desc The particle's age
     * @type {number}
     */
    this.age = 0;
    /**
     * @desc The particle's energy loss
     * @type {number}
     */
    this.energy = 1;
    /**
     * @desc Determines if the particle is dead or not
     * @type {number}
     */
    this.dead = false;
    /**
     * @desc Determines if the particle is sleeping or not
     * @type {number}
     */
    this.sleep = false;
    /**
     * @desc The particle's body
     * @type {object}
     */
    this.body = null;
    /**
     * @desc The particle's parent
     * @type {?Emitter}
     */
    this.parent = null;
    /**
     * @desc The particle's mass
     * @type {number}
     */
    this.mass = 1;
    /**
     * @desc The particle's radius
     * @type {number}
     */
    this.radius = 10;
    /**
     * @desc The particle's alpha
     * @type {number}
     */
    this.alpha = 1;
    /**
     * @desc The particle's scale
     * @type {number}
     */
    this.scale = 1;
    /**
     * @desc Determines whether to use color or not
     * @type {boolean}
     */
    this.useColor = false;
    /**
     * @desc Determines whether to use alpha or not
     * @type {boolean}
     */
    this.useAlpha = false;
    /**
     * @desc The particle's easing
     * @type {number}
     */
    this.easing = setEasingByName(ease.easeLinear);
    /**
     * @desc The particle's position
     * @type {Vector3D}
     */
    this.p = new Vector3D();
    /**
     * @desc The particle's velocity
     * @type {Vector3D}
     */
    this.v = new Vector3D();
    /**
     * @desc The particle's acceleration
     * @type {Vector3D}
     */
    this.a = new Vector3D();
    /**
     * @desc The particle's last position, velocity and acceleration
     * @type {object}
     */
    this.old = {};
    /**
     * @desc The particle's old position
     * @type {number}
     */
    this.old.p = this.p.clone();
    /**
     * @desc The particle's old velocity
     * @type {number}
     */
    this.old.v = this.v.clone();
    /**
     * @desc The particle's old acceleration
     * @type {number}
     */
    this.old.a = this.a.clone();
    /**
     * @desc The particle's behaviours array
     * @type {number}
     */
    this.behaviours = [];
    /**
     * @desc The particle's transform collection
     * @type {number}
     */
    this.transform = {};
    /**
     * @desc The particle's color store
     * @type {number}
     */
    this.color = { r: 0, g: 0, b: 0 };
    /**
     * @desc The particle's rotation
     * @type {number}
     */
    this.rotation = new Vector3D();

    // override constructor props with passed properties.
    Util.setPrototypeByObj(this, properties);
  }

  /**
   * Gets the particle's current direction.
   *
   * @return {number}
   */
  getDirection() {
    return Math.atan2(this.v.x, -this.v.y) * (180 / PI);
  }

  /**
   * Clear's the particle's position, velocity, acceleration, color and rotation.
   * Destroy's the particle's transform collection & removes all behaviours.
   *
   * @return void
   */
  clear() {
    this.p.set(0, 0, 0);
    this.v.set(0, 0, 0);
    this.a.set(0, 0, 0);
    this.old.p.set(0, 0, 0);
    this.old.v.set(0, 0, 0);
    this.old.a.set(0, 0, 0);
    this.color.r = 0;
    this.color.g = 0;
    this.color.b = 0;

    this.rotation.clear();
    Util.destroyObject(this.transform);
    this.removeAllBehaviours();
  }

  /**
   * Updates the particle's properties by applying each behaviour to the particle.
   * Will also update the particle's energy, unless it's age is greater than it's life
   * in which case it will be destroyed.
   *
   * @param {number} time - Integration time
   * @param {integer} index - Particle index
   * @return void
   */
  update(time, index) {
    if (!this.sleep) {
      this.age += time;

      let i = this.behaviours.length;

      while (i--) {
        let behaviour = this.behaviours[i];

        behaviour && behaviour.applyBehaviour(this, time, index);
      }
    }

    if (this.age >= this.life) {
      this.destroy();
    } else {
      const scale = this.easing(this.age / this.life);

      this.energy = Math.max(1 - scale, 0);
    }
  }

  /**
   * Adds a behaviour to the particle.
   *
   * @param {Behaviour} behaviour - The behaviour to add to the particle
   * @return void
   */
  addBehaviour(behaviour) {
    this.behaviours.push(behaviour);
    behaviour.initialize(this);
  }

  /**
   * Adds multiple behaviours to the particle.
   *
   * @param {array<Behaviour>} behaviours - An array of behaviours to add to the particle
   * @return void
   */
  addBehaviours(behaviours) {
    let i = behaviours.length;

    while (i--) {
      this.addBehaviour(behaviours[i]);
    }
  }

  /**
   * Removes the behaviour from the particle.
   *
   * @param {Behaviour} behaviour - The behaviour to remove from the particle
   * @return void
   */
  removeBehaviour(behaviour) {
    const index = this.behaviours.indexOf(behaviour);

    if (index > -1) {
      this.behaviours.splice(index, 1);
    }
  }

  /**
   * Removes all behaviours from the particle.
   *
   * @return void
   */
  removeAllBehaviours() {
    Util.destroyArray(this.behaviours);
  }

  /**
   * Destroys the particle.
   *
   * @return void
   */
  destroy() {
    this.removeAllBehaviours();
    this.energy = 0;
    this.dead = true;
    this.parent = null;
  }
}
