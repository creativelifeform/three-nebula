import ease, { setEasingByName } from '../ease';

import { PI } from '../constants';
import { Util } from '../utils';
import { Vector3D } from '../math';

export default class Particle {
  /**
   * the Particle class
   * @param {Number} pObj - the parameters of particle config.
   * @example
   * var p = new Proton.Particle({life:3,dead:false});
   * or
   * var p = new Proton.Particle({mass:1,radius:100});
   * @constructor
   */
  constructor(pOBJ) {
    this.ID = 0;
    /**
     * @property {Number}  id - The particle's id
     */
    this.id = 'particle_' + Particle.ID++;
    this.name = 'Particle';
    this.reset('init');
    Util.setPrototypeByObj(this, pOBJ);
  }

  getDirection() {
    return Math.atan2(this.v.x, -this.v.y) * (180 / PI);
  }

  /**
   * @property {Number} life - The particle's life
   * @property {Number} age - The particle's age
   * @property {Number} energy - The particle's energy loss
   * @property {Boolean} dead - The particle is dead?
   * @property {Boolean} sleep - The particle is sleep?
   * @property {Object} target - The particle's target
   * @property {Object} body - The particle's body
   * @property {Number} mass - The particle's mass
   * @property {Number} radius - The particle's radius
   * @property {Number} alpha - The particle's alpha
   * @property {Number} scale - The particle's scale
   * @property {Number} rotation - The particle's rotation
   * @property {String|Number} color - The particle's color
   * @property {Function} easing - The particle's easing
   * @property {Vector3D} p - The particle's position
   * @property {Vector3D} v - The particle's velocity
   * @property {Vector3D} a - The particle's acceleration
   * @property {Array} behaviours - The particle's behaviours array
   * @property {Object} transform - The particle's transform collection
   */
  reset(init) {
    this.life = Infinity;
    this.age = 0;
    //energy loss
    this.energy = 1;
    this.dead = false;
    this.sleep = false;
    this.body = null;
    this.parent = null;
    this.mass = 1;
    this.radius = 10;
    this.alpha = 1;
    this.scale = 1;
    this.useColor = false;
    this.useAlpha = false;
    this.easing = setEasingByName(ease.easeLinear);

    if (init) {
      this.p = new Vector3D();
      this.v = new Vector3D();
      this.a = new Vector3D();
      this.old = {};
      this.old.p = this.p.clone();
      this.old.v = this.v.clone();
      this.old.a = this.a.clone();
      this.behaviours = [];
      this.transform = {};
      this.color = { r: 0, g: 0, b: 0 };
      this.rotation = new Vector3D();
    } else {
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

    return this;
  }

  update(time, index) {
    if (!this.sleep) {
      this.age += time;

      var i = this.behaviours.length;

      while (i--) {
        this.behaviours[i] &&
          this.behaviours[i].applyBehaviour(this, time, index);
      }
    } else {
      //sleep
    }

    if (this.age >= this.life) {
      this.destroy();
    } else {
      var scale = this.easing(this.age / this.life);

      this.energy = Math.max(1 - scale, 0);
    }
  }

  addBehaviour(behaviour) {
    this.behaviours.push(behaviour);
    behaviour.initialize(this);
  }

  addBehaviours(behaviours) {
    var i = behaviours.length;

    while (i--) {
      this.addBehaviour(behaviours[i]);
    }
  }

  removeBehaviour(behaviour) {
    var index = this.behaviours.indexOf(behaviour);

    if (index > -1) {
      this.behaviours.splice(index, 1);
    }
  }

  removeAllBehaviours() {
    Util.destroyArray(this.behaviours);
  }

  /**
   * Destory this particle
   * @method destroy
   */
  destroy() {
    this.removeAllBehaviours();
    this.energy = 0;
    this.dead = true;
    this.parent = null;
  }
}
