import {
  DEFAULT_BIND_EMITTER,
  DEFAULT_BIND_EMITTER_EVENT,
  DEFAULT_DAMPING,
  DEFAULT_EMITTER_INDEX,
  DEFAULT_EMITTER_RATE,
} from './constants';
import EventDispatcher, {
  EMITTER_DEAD,
  PARTICLE_CREATED,
  PARTICLE_DEAD,
  PARTICLE_UPDATE,
  SYSTEM_UPDATE,
} from '../events';
import { INTEGRATION_TYPE_EULER, integrate } from '../math';
import { mulberry32, hashSeed, randomSeed } from '../math/rng';
import type { RNG } from '../math/rng';
import { Util, uid } from '../utils';

import { InitializerUtil, Rate } from '../initializer';
import Particle from '../core/Particle';
import isNumber from 'lodash/isNumber';
import { EMITTER_TYPE_EMITTER as type } from './types';
import type Initializer from '../initializer/Initializer';
import type Behaviour from '../behaviour/Behaviour';
import type System from '../core/System';

interface Vector3Props {
  x?: number;
  y?: number;
  z?: number;
}

/**
 * Emitters are the System engine's particle factories. They cause particles to
 * be rendered by emitting them, and store all particle initializers and behaviours.
 */
export default class Emitter extends Particle {
  particles: Particle[];
  initializers: Initializer[];
  emitterBehaviours: Behaviour[];
  currentEmitTime: number;
  totalEmitTimes: number;
  damping: number;
  bindEmitter: boolean;
  bindEmitterEvent: boolean;
  rate: Rate;
  isEmitting: boolean;
  cID: number;
  name: string;
  eventDispatcher: EventDispatcher;
  // The emitter's own seeded stream (emitter-level draws, e.g. the rate) and the
  // seed its particles derive from. Defaults to random; System.addEmitter /
  // setSeed re-derive it deterministically from the system seed + emitter index.
  seed: number;
  rng: RNG;
  // Monotonic spawn counter — never reused, survives pooling — so each particle
  // gets a stable, unique index for its ID and seed.
  _spawnCount: number;
  // Emitter hierarchy (spec 01, Stage 1). `nodeId` is this emitter's tree-path
  // address (e.g. "0/children/0"), assigned when loaded from a hierarchy; it is
  // the key child seeds derive from and the stamp put on emitted particles.
  // `childNodes` are authored child templates, each instanced once per parent
  // particle. A live instance sets `_template` (the node it was cloned from) and
  // `_parentParticle` (the particle it rides); `_freeInstances` is a template's
  // own free-list of dormant instances, so recycling bounds instance count by
  // live particles rather than cumulative spawns.
  nodeId: string;
  childNodes: Emitter[];
  _template: Emitter | null;
  _parentParticle: Particle | null;
  _freeInstances: Emitter[];

  constructor(properties?: Record<string, unknown>) {
    super(properties);

    this.type = type;
    this.seed = randomSeed();
    this.rng = mulberry32(this.seed);
    this._spawnCount = 0;
    this.nodeId = '';
    this.childNodes = [];
    this._template = null;
    this._parentParticle = null;
    this._freeInstances = [];
    this.particles = [];
    this.initializers = [];
    this.behaviours = [];
    this.emitterBehaviours = [];
    this.currentEmitTime = 0;
    this.totalEmitTimes = -1;
    this.damping = DEFAULT_DAMPING;
    this.bindEmitter = DEFAULT_BIND_EMITTER;
    this.bindEmitterEvent = DEFAULT_BIND_EMITTER_EVENT;
    this.rate = DEFAULT_EMITTER_RATE;
    this.isEmitting = false;
    this.id = `emitter-${uid()}`;
    this.cID = 0;
    this.name = 'Emitter';
    this.index = DEFAULT_EMITTER_INDEX;
    this.eventDispatcher = new EventDispatcher();
  }

  /**
   * An emitter's parent is the System it was added to (a particle's parent is
   * its emitter, hence the inherited `parent` field is narrowed here).
   */
  get system(): System | null {
    return this.parent as System | null;
  }

  /**
   * Re-derives this emitter's seed (and particle stream) from the system seed
   * and its index. Called by System.addEmitter / setSeed so that emitters loaded
   * in the same order produce the same streams across runs.
   */
  reseed(systemSeed: number, index: number): this {
    this.seed = hashSeed(systemSeed, index);
    this.rng = mulberry32(this.seed);
    this._spawnCount = 0;

    return this;
  }

  /**
   * Derives a child instance's seed from its node's tree-path address and the
   * parent particle's (stable, deterministic) id, so a given parent always
   * produces the same child stream. Mirrors `reseed` but keyed on identity
   * rather than array index (a child instance has no fixed index).
   */
  reseedFromParent(nodeId: string, parentParticleId: string): this {
    this.seed = hashSeed(nodeId, parentParticleId);
    this.rng = mulberry32(this.seed);
    this._spawnCount = 0;

    return this;
  }

  /**
   * Cold path: builds a fresh instance of this node. Config (initializers,
   * behaviours, child templates) is shared by reference — it is read-only during
   * simulation — while all mutable runtime state is per-instance. The instance
   * gets its own Rate over the template's immutable Spans so interval counters
   * don't collide across the many instances of one node.
   */
  _createInstance(): Emitter {
    const inst = new Emitter();

    inst._template = this;
    inst.nodeId = this.nodeId;
    inst.initializers = this.initializers;
    inst.behaviours = this.behaviours;
    inst.emitterBehaviours = this.emitterBehaviours;
    inst.childNodes = this.childNodes;
    inst.damping = this.damping;
    inst.rate = new Rate(this.rate.numPan, this.rate.timePan);
    inst.totalEmitTimes = this.totalEmitTimes;
    inst.life = this.life;

    return inst;
  }

  /**
   * Clears an instance's runtime state so a pooled instance is indistinguishable
   * from a cold one. Deliberately does NOT touch the shared config arrays (that
   * would mutate the template every other instance reads) — only per-instance
   * mutable fields. `totalEmitTimes`/`life` are restored from the template since
   * `generate` decrements them as the instance runs.
   */
  _resetInstanceState(): void {
    const template = this._template as Emitter;

    this.age = 0;
    this.dead = false;
    this.energy = 1;
    this.currentEmitTime = 0;
    this.totalEmitTimes = template.totalEmitTimes;
    this.life = template.life;
    this._spawnCount = 0;
    this.isEmitting = false;
    this.particles.length = 0;
    this._parentParticle = null;
    this.position.set(0, 0, 0);
    this.rotation.clear();
  }

  /**
   * Warm-or-cold acquire of an instance of this node bound to `parentParticle`.
   * Pops the free-list when possible (no allocation on the warm path), otherwise
   * builds one. The instance is reseeded from the parent's id so its stream is
   * deterministic. Call on the template node; the returned instance carries a
   * `_template` back-reference for release.
   */
  acquireInstance(parentParticle: Particle): Emitter {
    const inst = this._freeInstances.pop() ?? this._createInstance();

    inst._resetInstanceState();
    inst._parentParticle = parentParticle;
    inst.reseedFromParent(this.nodeId, parentParticle.id);
    inst.isEmitting = true;

    return inst;
  }

  /**
   * Returns an instance to this node's free-list for reuse. Callers must ensure
   * the instance has no live particles first (the System's release path only
   * releases once a detached instance has drained).
   */
  releaseInstance(inst: Emitter): void {
    inst.isEmitting = false;
    this._freeInstances.push(inst);
  }

  /**
   * Proxy method for the internal event dispatcher's dispatchEvent method.
   */
  dispatch(event: string, target: unknown = this): void {
    this.eventDispatcher.dispatchEvent(event, target);
  }

  /**
   * Sets the emitter rate.
   */
  setRate(rate: Rate): this {
    this.rate = rate;

    return this;
  }

  /**
   * Sets the position of the emitter.
   */
  setPosition(newPosition: Vector3Props = {}): this {
    const { position } = this;
    const { x = position.x, y = position.y, z = position.z } = newPosition;

    this.position.set(x, y, z);

    return this;
  }

  /**
   * Sets the rotation of the emitter.
   */
  setRotation(newRotation: Vector3Props = {}): this {
    const { rotation } = this;
    const { x = rotation.x, y = rotation.y, z = rotation.z } = newRotation;

    this.rotation.set(x, y, z);

    return this;
  }

  /**
   * Sets the total number of times the emitter should emit particles as well as
   * the emitter's life. Also intializes the emitter rate. This enables the
   * emitter to emit particles.
   */
  emit(
    totalEmitTimes: number | 'once' = Infinity,
    life: number = Infinity
  ): this {
    this.currentEmitTime = 0;
    this.totalEmitTimes = isNumber(totalEmitTimes) ? totalEmitTimes : Infinity;

    if (totalEmitTimes === 1) {
      this.life = totalEmitTimes;
    } else {
      this.life = isNumber(life) ? life : Infinity;
    }

    this.rate.resetInterval(this.rng);
    this.isEmitting = true;

    return this;
  }

  /**
   * Experimental emit method that is designed to be called from the System.emit method.
   */
  experimental_emit(): this {
    const { isEmitting, totalEmitTimes, life } = this;

    if (!isEmitting) {
      this.currentEmitTime = 0;

      if (!totalEmitTimes) {
        this.setTotalEmitTimes(Infinity);
      }

      if (!life) {
        this.setLife(Infinity);
      }

      this.rate.init();
      this.isEmitting = true;
    }

    return this;
  }

  /**
   * Sets the total emit times for the emitter.
   */
  setTotalEmitTimes(totalEmitTimes: number = Infinity): this {
    this.totalEmitTimes = isNumber(totalEmitTimes) ? totalEmitTimes : Infinity;

    return this;
  }

  /**
   * Sets the life of the emitter.
   */
  setLife(life: number = Infinity): this {
    if (this.totalEmitTimes === 1) {
      this.life = this.totalEmitTimes;
    } else {
      this.life = isNumber(life) ? life : Infinity;
    }

    return this;
  }

  /**
   * Stops the emitter from emitting particles.
   */
  stopEmit(): void {
    this.totalEmitTimes = -1;
    this.currentEmitTime = 0;
    this.isEmitting = false;
  }

  /**
   * Kills all of the emitter's particles.
   */
  removeAllParticles(): void {
    let i = this.particles.length;

    while (i--) {
      this.particles[i].dead = true;
    }
  }

  /**
   * Adds a particle initializer to the emitter.
   */
  addInitializer(initializer: Initializer): this {
    this.initializers.push(initializer);

    return this;
  }

  /**
   * Adds multiple particle initializers to the emitter.
   */
  addInitializers(initializers: Initializer[]): this {
    let i = initializers.length;

    while (i--) {
      this.addInitializer(initializers[i]);
    }

    return this;
  }

  /**
   * Sets the emitter's particle initializers.
   */
  setInitializers(initializers: Initializer[]): this {
    this.initializers = initializers;

    return this;
  }

  /**
   * Removes an initializer from the emitter's initializers array.
   */
  removeInitializer(initializer: Initializer): this {
    const index = this.initializers.indexOf(initializer);

    if (index > -1) {
      this.initializers.splice(index, 1);
    }

    return this;
  }

  /**
   * Removes all initializers.
   */
  removeAllInitializers(): this {
    Util.destroyArray(this.initializers);

    return this;
  }

  /**
   * Adds a behaviour to the emitter.
   */
  addBehaviour(behaviour: Behaviour): this {
    this.behaviours.push(behaviour);

    return this;
  }

  /**
   * Adds multiple behaviours to the emitter.
   */
  addBehaviours(behaviours: Behaviour[]): this {
    let i = behaviours.length;

    while (i--) {
      this.addBehaviour(behaviours[i]);
    }

    return this;
  }

  /**
   * Sets the emitter's behaviours.
   */
  setBehaviours(behaviours: Behaviour[]): this {
    this.behaviours = behaviours;

    return this;
  }

  /**
   * Removes the behaviour from the emitter's behaviours array.
   */
  removeBehaviour(behaviour: Behaviour): this {
    const index = this.behaviours.indexOf(behaviour);

    if (index > -1) {
      this.behaviours.splice(index, 1);
    }

    return this;
  }

  /**
   * Removes all behaviours from the emitter.
   */
  removeAllBehaviours(): this {
    Util.destroyArray(this.behaviours);

    return this;
  }

  /**
   * Adds an emitter behaviour to the emitter.
   */
  addEmitterBehaviour(behaviour: Behaviour): this {
    this.emitterBehaviours.push(behaviour);

    behaviour.initialize(this);

    return this;
  }

  /**
   * Adds multiple behaviours to the emitter.
   */
  addEmitterBehaviours(behaviours: Behaviour[]): this {
    let i = behaviours.length;

    while (i--) {
      this.addEmitterBehaviour(behaviours[i]);
    }

    return this;
  }

  /**
   * Sets the emitter's behaviours.
   */
  setEmitterBehaviours(behaviours: Behaviour[]): this {
    const length = behaviours.length;

    this.emitterBehaviours = behaviours;

    for (let i = 0; i < length; i++) {
      this.emitterBehaviours[i].initialize(this);
    }

    return this;
  }

  /**
   * Removes the behaviour from the emitter's behaviours array.
   */
  removeEmitterBehaviour(behaviour: Behaviour): this {
    const index = this.emitterBehaviours.indexOf(behaviour);

    if (index > -1) {
      this.emitterBehaviours.splice(index, 1);
    }

    return this;
  }

  /**
   * Removes all behaviours from the emitter.
   */
  removeAllEmitterBehaviours(): this {
    Util.destroyArray(this.emitterBehaviours);

    return this;
  }

  /**
   * Adds the event listener for the EMITTER_DEAD event.
   */
  addOnEmitterDeadEventListener(onEmitterDead: () => void): this {
    this.eventDispatcher.addEventListener(`${this.id}_${EMITTER_DEAD}`, () =>
      onEmitterDead()
    );

    return this;
  }

  /**
   * Creates a particle by retreiving one from the pool and setting it up with
   * the supplied initializer and behaviour.
   */
  createParticle(): Particle {
    // system is non-null throughout an attached emitter's lifecycle; faithful
    // to the pre-migration crash if this runs while the emitter is detached.
    const particle = this.system!.pool.get(Particle);
    const index = this.particles.length;

    this.setupParticle(particle, index);
    this.system && this.system.dispatch(PARTICLE_CREATED, particle);
    this.bindEmitterEvent && this.dispatch(PARTICLE_CREATED, particle);

    return particle;
  }

  /**
   * Sets up a particle by running all initializers on it and setting its behaviours.
   * Also adds the particle to this.particles.
   */
  setupParticle(particle: Particle, index?: number): void {
    const { initializers, behaviours } = this;

    // Deterministic identity + stream, derived from the emitter seed and a
    // monotonic spawn index (assigned before initializers run so they draw from
    // the particle's own seeded stream).
    const spawnIndex = this._spawnCount++;

    particle.id = `particle-${this.seed}-${spawnIndex}`;
    particle.rng = mulberry32(hashSeed(this.seed, spawnIndex));
    // Stamp the spawning emitter's node id (null for a flat top-level emitter,
    // whose nodeId is still ''); lights up automatically once hierarchy loading
    // assigns tree-path ids.
    particle.emitterId = this.nodeId || null;

    InitializerUtil.initialize(this, particle, initializers);

    particle.addBehaviours(behaviours);
    particle.parent = this;
    particle.index = index;

    this.particles.push(particle);
  }

  /**
   * Updates the emitter according to the time passed by calling the generate
   * and integrate methods.
   */
  update(time: number): void {
    if (!this.isEmitting && this.particles.length === 0) {
      return;
    }

    this.age += time;

    if (this.dead || this.age >= this.life) {
      this.destroy();
    }

    if (this.isEmitting) {
      this.generate(time);
    }

    this.integrate(time);

    let i = this.particles.length;

    while (i--) {
      const particle = this.particles[i];

      if (particle.dead) {
        this.system && this.system.dispatch(PARTICLE_DEAD, particle);
        this.bindEmitterEvent && this.dispatch(PARTICLE_DEAD, particle);
        // faithful to the pre-migration crash if the emitter is detached.
        this.system!.pool.expire(particle.reset());
        this.particles.splice(i, 1);
        if (this.particles.length === 0) {
          this.system && this.system.dispatch(SYSTEM_UPDATE);
        }
      }
    }

    this.updateEmitterBehaviours(time);
  }

  /**
   * Updates the emitter's emitter behaviours.
   */
  updateEmitterBehaviours(time: number): void {
    if (this.sleep) {
      return;
    }

    const length = this.emitterBehaviours.length;

    for (let i = 0; i < length; i++) {
      this.emitterBehaviours[i].applyBehaviour(this, time, i);
    }
  }

  /**
   * Runs the integration algorithm on the emitter and all particles.
   */
  integrate(time: number): void {
    const integrationType = this.system
      ? this.system.integrationType
      : INTEGRATION_TYPE_EULER;
    const damping = 1 - this.damping;

    integrate(this, time, damping, integrationType);

    let index = this.particles.length;

    while (index--) {
      const particle = this.particles[index];

      particle.update(time, index);
      integrate(particle, time, damping, integrationType);

      this.system && this.system.dispatch(PARTICLE_UPDATE, particle);
      this.bindEmitterEvent && this.dispatch(PARTICLE_UPDATE, particle);
    }
  }

  /**
   * Generates new particles.
   */
  generate(time: number): void {
    if (this.totalEmitTimes === 1) {
      let i = this.rate.getValue(99999, this.rng);

      if (i > 0) {
        this.cID = i;
      }

      while (i--) {
        this.createParticle();
      }

      this.totalEmitTimes = 0;

      return;
    }

    this.currentEmitTime += time;

    if (this.currentEmitTime < this.totalEmitTimes) {
      let i = this.rate.getValue(time, this.rng);

      if (i > 0) {
        this.cID = i;
      }

      while (i--) {
        this.createParticle();
      }
    }
  }

  /**
   * Kills the emitter.
   */
  destroy(): void {
    this.dead = true;
    this.energy = 0;
    this.totalEmitTimes = -1;

    if (this.particles.length == 0) {
      this.isEmitting = false;
      this.removeAllInitializers();
      this.removeAllBehaviours();
      this.dispatch(`${this.id}_${EMITTER_DEAD}`);

      this.system && this.system.removeEmitter(this);
    }
  }
}
