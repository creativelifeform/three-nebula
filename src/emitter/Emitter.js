import {
  DEFAULT_BIND_EMITTER,
  DEFAULT_BIND_EMITTER_EVENT,
  DEFAULT_DAMPING,
  DEFAULT_EMITTER_RATE
} from './constants';
import EventDispatcher, { PARTICLE_CREATED } from '../events';

import { BIND_EMITTER_EVENT } from '../constants';
import { InitializerUtil } from '../initializer';
import Particle from '../core/Particle';
import Util from '../utils/Util';
import { integrator } from '../core/Proton';
import uid from '../utils/uid';

/**
 * Emitters are the Proton engine's particle factories. They cause particles to
 * be rendered by emitting them, and store all particle initializers and behaviours.
 *
 */
export default class Emitter extends Particle {
  /**
   * Constructs an Emitter instance.
   *
   * @param {object} properties - The properties to instantiate the particle with
   * @return void
   */
  constructor(properties) {
    super(properties);

    /**
     * @desc The particles emitted by this emitter.
     * @type {array}
     */
    this.particles = [];

    /**
     * @desc The initializers for particles emitted by this emitter.
     * @type {array}
     */
    this.initializers = [];

    /**
     * @desc The behaviours for particles emitted by this emitter.
     * @type {array}
     */
    this.behaviours = [];

    /**
     * @desc The current emit iteration.
     * @type {integer}
     */
    this.currentEmitTime = 0;

    /**
     * @desc The total number of times the emitter has emitted particles.
     * @type {integer}
     */
    this.totalEmitTimes = -1;

    /**
     * @desc The friction coefficient for all particle to emit by.
     * @type {number}
     */
    this.damping = DEFAULT_DAMPING;

    /**
     * @desc Ensures that particles emitted by this emitter are positioned
     * according to the emitter's properties.
     * @type {boolean}
     */
    this.bindEmitter = DEFAULT_BIND_EMITTER;

    /**
     * @desc Determines if the emitter will dispatch internal events. Defaults
     * to false
     * @type {boolean}
     */
    this.bindEmitterEvent = DEFAULT_BIND_EMITTER_EVENT;

    /**
     * @desc The number of particles to emit per second (a [particle]/b [s])
     * @type {Rate}
     */
    this.rate = DEFAULT_EMITTER_RATE;

    /**
     * @desc The emitter's id.
     * @type {string}
     */
    this.id = `emitter-${uid()}`;
    this.cID = 0;
    this.name = 'Emitter';

    /**
     * @desc The emitter's internal event dispatcher.
     * @type {EventDispatcher}
     */
    this.eventDispatcher = new EventDispatcher();
  }

  /**
   * Proxy method for the internal event dispatcher's dispatchEvent method.
   *
   * @param {string} event - The event to dispatch
   * @param {object<Particle>} [target=this] - The event target
   */
  dispatch(event, target = this) {
    this.eventDispatcher.dispatchEvent(event, target);
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
   * Sets the total number of times the emitter should emit particles as well as
   * the emitter's life. Also intializes the emitter rate.
   * This enables the emitter to emit particles.
   *
   * TODO Refactor this so that it does not accept mixed type arguments.
   *
   * @param {number} totalEmitTimes - the total number of times to emit particles
   * @param {number} life - the life of this emitter in milliseconds
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
   * Stops the emitter from emitting particles.
   *
   * @return void
   */
  stopEmit() {
    this.totalEmitTimes = -1;
    this.currentEmitTime = 0;
  }

  /**
   * Kills all of the emitter's particles.
   *
   * TODO Rename this method to killAllParticles
   *
   * @return void
   */
  removeAllParticles() {
    let i = this.particles.length;

    while (i--) {
      this.particles[i].dead = true;
    }
  }

  /**
   * Creates a particle by retreiving one from the pool and setting it up with
   * the supplied initializer and behaviour.
   *
   * @param {Initializer} initializer - The initializer that will set the particle's initial properties
   * @param {Behaviour} behaviour - The behaviour that will control the particle
   * @return {Emitter}
   */
  createParticle(initializer, behaviour) {
    const particle = this.parent.pool.get(Particle);

    this.setupParticle(particle, initializer, behaviour);
    this.parent && this.parent.dispatch(PARTICLE_CREATED, particle);
    this.bindEmitterEvent && this.dispatch(PARTICLE_CREATED, particle);

    return particle;
  }

  /**
   * Add an initializer to this emitter.
   *
   * @deprecated This will be removed in the next major version.
   * @param {object} pObj
   * @return void
   */
  addSelfInitialize(pObj) {
    /* istanbul ignore if */
    if (pObj['init']) {
      pObj.init(this);
      /* istanbul ignore else */
    } else {
      this.initAll();
    }
  }

  /**
   * Adds particle initializer(s) to the emitter.
   * Each initializer is run on each particle when they are created.
   *
   * @deprecated This will be removed in the next major version use addInitializer or addInitializers.
   * @return {Emitter}
   */
  addInitialize() {
    /* istanbul ignore next */
    var i = arguments.length;

    /* istanbul ignore next */
    while (i--) this.initializers.push(arguments[i]);
  }

  /**
   * Adds a particle initializer to the emitter.
   * Each initializer is run on each particle when they are created.
   *
   * @param {Initializer} initializer - The initializer to add
   * @return {Emitter}
   */
  addInitializer(initializer) {
    this.initializers.add(initializer);

    return this;
  }

  /**
   * Adds multiple particle initializers to the emitter.
   *
   * @param {array<Initializer>} initializers - an array of particle initializers
   * @return {Emitter}
   */
  addInitializers(initializers) {
    let i = initializers.length;

    while (i--) {
      this.addInitializer(initializers[i]);
    }

    return this;
  }

  /**
   * Sets the emitter's particle initializers.
   *
   * @param {array<Initializer>} initializers - an array of particle initializers
   * @return {Emitter}
   */
  setInitializers(initializers) {
    this.initializers = initializers;

    return this;
  }

  /**
   * @deprecated This will be removed in the next major version use removeInitializer instead.
   * @param {Initializer} initializer - The initializer to remove
   */
  removeInitialize(initializer) {
    /* istanbul ignore next */
    var index = this.initializers.indexOf(initializer);

    /* istanbul ignore next */
    if (index > -1) this.initializers.splice(index, 1);
  }

  /**
   * Removes an initializer from the emitter's initializers array.
   *
   * @param {Initializer} initializer - The initializer to remove
   * @return {Emitter}
   */
  removeInitializer(initializer) {
    const index = this.initializers.indexOf(initializer);

    if (index > -1) {
      this.initializers.splice(index, 1);
    }

    return this;
  }

  /**
   * Removes all initializers.
   *
   * @return {Emitter}
   */
  removeInitializers() {
    Util.destroyArray(this.initializers);

    return this;
  }

  /**
   * Adds a behaviour to the emitter. All emitter behaviours are added to each particle when
   * they are emitted.
   *
   * @param {Behaviour} behaviour - The behaviour to add to the emitter
   * @return {Emitter}
   */
  addBehaviour(behaviour) {
    this.behaviours.push(behaviour);

    return this;
  }

  /**
   * Adds multiple behaviours to the emitter.
   *
   * @param {array<Behaviour>} behaviours - an array of emitter behaviours
   * @return {Emitter}
   */
  addBehaviours(behaviours) {
    let i = behaviours.length;

    while (i--) {
      this.addBehaviour(behaviours[i]);
    }

    return this;
  }

  /**
   * Sets the emitter's behaviours.
   *
   * @param {array<Behaviour>} behaviours - an array of emitter behaviours
   * @return {Emitter}
   */
  setBehaviours(behaviours) {
    this.behaviours = behaviours;

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
    var initializers = this.initializers;
    var behaviours = this.behaviours;

    if (initialize) {
      if (Util.isArray(initialize)) initializers = initialize;
      else initializers = [initialize];
    }

    if (behaviour) {
      if (Util.isArray(behaviour)) behaviours = behaviour;
      else behaviours = [behaviour];
    }

    InitializerUtil.initialize(this, particle, initializers);
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
