import { BIND_EMITTER_EVENT } from '../constants';
import EventDispatcher from '../events/EventDispatcher';
import InitializeUtil from '../initialize/InitializeUtil';
import Particle from '../core/Particle';
import Rate from '../initialize/Rate';
import Util from '../utils/Util';
import { integrator } from '../core/Proton';
import uid from '../utils/uid';

export default class Emitter extends Particle {
  constructor(pObj) {
    super(pObj);

    this.initializes = [];
    this.particles = [];
    this.behaviours = [];
    this.currentEmitTime = 0;
    this.totalEmitTimes = -1;

    /**
     * @property {Number} damping -The friction coefficient for all particle emit by This;
     * @default 0.006
     */
    this.damping = 0.006;

    /**
     * If bindEmitter the particles can bind this emitter's property;
     * @property bindEmitter
     * @type {Boolean}
     * @default true
     */
    this.bindEmitter = true;

    /**
     * The number of particles per second emit (a [particle]/b [s]);
     * @property rate
     * @type {Rate}
     * @default Rate(1, .1)
     */
    this.rate = new Rate(1, 0.1);

    /**
     * The emitter's id;
     * @property id
     * @type {String} id
     */
    this.id = `emitter_${uid()}`;
    this.cID = 0;
    this.name = 'Emitter';
    this.eventDispatcher = new EventDispatcher();
  }

  /**
   * Sets the emitter rate.
   *
   * @param {Rate} rate - a rate initializer object
   * @return {Emitter}
   */
  setRate(rate) {
    this.rate = rate;

    return this;
  }

  /**
   * Sets the position of the emitter.
   *
   * @param {object} position - an object containing x, y and z props
   * @return {Emitter}
   */
  setPosition(position = {}) {
    const { p } = this;
    const { x = p.x, y = p.y, z = p.z } = position;

    this.p.set(x, y, z);

    return this;
  }

  /**
   * Makes the emitter emit particles.
   *
   * @param {Number} totalEmitTimes - the total number of times to emit particles
   * @param {String} life - the life of this emitter
   * @return {Emitter}
   */
  emit(totalEmitTimes = Infinity, life) {
    this.currentEmitTime = 0;
    this.totalEmitTimes = totalEmitTimes;

    if (life == true || life == 'life' || life == 'destroy') {
      this.life = totalEmitTimes == 'once' ? 1 : this.totalEmitTimes;
    } else if (!isNaN(life)) {
      this.life = life;
    }

    this.rate.init();

    return this;
  }

  /**
   * stop emiting
   * @method stopEmit
   */
  stopEmit() {
    this.totalEmitTimes = -1;
    this.currentEmitTime = 0;
  }

  /**
   * remove current all particles
   * @method removeAllParticles
   */
  removeAllParticles() {
    var i = this.particles.length;

    while (i--) this.particles[i].dead = true;
  }

  /**
   * create single particle;
   *
   * can use emit({x:10},new Gravity(10),{'particleUpdate',fun}) or emit([{x:10},new Initialize],new Gravity(10),{'particleUpdate',fun})
   * @method removeAllParticles
   */
  createParticle(initialize, behaviour) {
    var particle = this.parent.pool.get(Particle);

    this.setupParticle(particle, initialize, behaviour);
    this.parent &&
      this.parent.eventDispatcher.dispatchEvent('PARTICLE_CREATED', particle);
    BIND_EMITTER_EVENT && this.dispatchEvent('PARTICLE_CREATED', particle);

    return particle;
  }
  /**
   * add initialize to this emitter
   * @method addSelfInitialize
   */
  addSelfInitialize(pObj) {
    if (pObj['init']) {
      pObj.init(this);
    } else {
      this.initAll();
    }
  }

  /**
   * add the Initialize to particles;
   *
   * you can use initializes array:for example emitter.addInitialize(initialize1,initialize2,initialize3);
   * @method addInitialize
   * @param {Initialize} initialize like this new Radius(1, 12)
   */
  addInitialize() {
    var i = arguments.length;

    while (i--) this.initializes.push(arguments[i]);
  }

  /**
   * Proxy method for adding multiple initializers.
   *
   * @see addInitialize
   * @param {array<Initialize>} properties - an array of emitter initializers
   * @return {Emitter}
   */
  setProperties(properties) {
    let i = properties.length;

    while (i--) {
      this.initializes.push(properties[i]);
    }

    return this;
  }

  /**
   * remove the Initialize
   * @method removeInitialize
   * @param {Initialize} initialize a initialize
   */
  removeInitialize(initializer) {
    var index = this.initializes.indexOf(initializer);

    if (index > -1) this.initializes.splice(index, 1);
  }

  /**
   * remove all Initializes
   * @method removeInitializers
   */
  removeInitializers() {
    Util.destroyArray(this.initializes);
  }
  /**
   * add the Behaviour to particles;
   *
   * you can use Behaviours array:emitter.addBehaviour(Behaviour1,Behaviour2,Behaviour3);
   * @method addBehaviour
   * @param {Behaviour} behaviour like this new Color('random')
   */
  addBehaviour() {
    var i = arguments.length;

    while (i--) this.behaviours.push(arguments[i]);
  }

  /**
   * Proxy method for adding multiple behaviours.
   *
   * @see addInitialize
   * @param {array<Behaviour>} behaviours - an array of emitter behaviours
   * @return {Emitter}
   */
  setBehaviours(behaviours) {
    let i = behaviours.length;

    while (i--) {
      this.behaviours.push(behaviours[i]);
    }

    return this;
  }

  /**
   * remove the Behaviour
   * @method removeBehaviour
   * @param {Behaviour} behaviour a behaviour
   */
  removeBehaviour(behaviour) {
    var index = this.behaviours.indexOf(behaviour);

    if (index > -1) this.behaviours.splice(index, 1);
  }
  /**
   * remove all behaviours
   * @method removeAllBehaviours
   */
  removeAllBehaviours() {
    Util.destroyArray(this.behaviours);
  }

  integrate(time) {
    var damping = 1 - this.damping;

    integrator.integrate(this, time, damping);

    var i = this.particles.length;

    while (i--) {
      var particle = this.particles[i];

      particle.update(time, i);
      integrator.integrate(particle, time, damping);

      this.parent &&
        this.parent.eventDispatcher.dispatchEvent('PARTICLE_UPDATE', particle);
      BIND_EMITTER_EVENT && this.dispatchEvent('PARTICLE_UPDATE', particle);
    }
  }

  emitting(time) {
    if (this.totalEmitTimes == 'once') {
      var i = this.rate.getValue(99999);

      if (i > 0) this.cID = i;
      while (i--) this.createParticle();
      this.totalEmitTimes = 'none';
    } else if (!isNaN(this.totalEmitTimes)) {
      this.currentEmitTime += time;
      if (this.currentEmitTime < this.totalEmitTimes) {
        i = this.rate.getValue(time);

        if (i > 0) this.cID = i;
        while (i--) this.createParticle();
      }
    }
  }

  update(time) {
    this.age += time;
    if (this.dead || this.age >= this.life) {
      this.destroy();
    }

    this.emitting(time);
    this.integrate(time);

    var particle,
      i = this.particles.length;

    while (i--) {
      particle = this.particles[i];
      if (particle.dead) {
        this.parent &&
          this.parent.eventDispatcher.dispatchEvent('PARTICLE_DEAD', particle);
        BIND_EMITTER_EVENT && this.dispatchEvent('PARTICLE_DEAD', particle);

        this.parent.pool.expire(particle.reset());
        this.particles.splice(i, 1);
      }
    }
  }

  setupParticle(particle, initialize, behaviour) {
    var initializes = this.initializes;
    var behaviours = this.behaviours;

    if (initialize) {
      if (Util.isArray(initialize)) initializes = initialize;
      else initializes = [initialize];
    }

    if (behaviour) {
      if (Util.isArray(behaviour)) behaviours = behaviour;
      else behaviours = [behaviour];
    }

    InitializeUtil.initialize(this, particle, initializes);
    particle.addBehaviours(behaviours);
    particle.parent = this;
    this.particles.push(particle);
  }

  /**
   * Destory this Emitter
   * @method destroy
   */
  destroy() {
    this.dead = true;
    this.energy = 0;
    this.totalEmitTimes = -1;

    if (this.particles.length == 0) {
      this.removeInitializers();
      this.removeAllBehaviours();

      this.parent && this.parent.removeEmitter(this);
    }
  }
}
