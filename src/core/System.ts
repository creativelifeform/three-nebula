import EventDispatcher, {
  EMITTER_ADDED,
  EMITTER_REMOVED,
  PARTICLE_DEAD,
  SYSTEM_UPDATE,
  SYSTEM_UPDATE_AFTER,
} from '../events';

import {
  DEFAULT_MAX_DEPTH,
  DEFAULT_MAX_EMITTER_INSTANCES,
  DEFAULT_MAX_SUB_STEPS,
  DEFAULT_SYSTEM_DELTA,
} from './constants';
import Emitter from '../emitter/Emitter';
import { INTEGRATION_TYPE_EULER } from '../math/constants';
import { randomSeed } from '../math/rng';
import { POOL_MAX } from '../constants';
import Pool from './Pool';
import fromJSON, { SystemJSON } from './fromJSON';
import fromJSONAsync from './fromJSONAsync';
import { CORE_TYPE_SYSTEM as type } from './types';
import type BaseRenderer from '../renderer/BaseRenderer';
import type Particle from './Particle';
import type { Listener } from '../events/EventDispatcher';

type ThreeApi = typeof import('three');

interface LifeCycleHooks {
  onStart?: () => void;
  onUpdate?: Listener;
  onEnd?: () => void;
}

interface FromJSONAsyncOptions {
  shouldAutoEmit?: boolean;
}

/**
 * The core of the three-system particle engine. A System instance can contain
 * multiple emitters, each with their own initializers and behaviours.
 */
export default class System {
  type: string;
  canUpdate: boolean;
  preParticles: number;
  integrationType: string;
  emitters: Emitter[];
  renderers: BaseRenderer[];
  pool: Pool;
  eventDispatcher: EventDispatcher;
  // Root of the seed hierarchy (Stage 2). Defaults to random, so systems still
  // vary run-to-run; set an explicit seed (here or via setSeed) for reproducible
  // output. Every emitter/particle stream derives from this.
  seed: number;
  // Fixed-timestep accumulator (Stage 3), used only by `tick`. `update` remains
  // the single-fixed-step primitive; these govern how `tick` maps real elapsed
  // time onto fixed steps. Both are public so a consumer can retune them.
  fixedTimeStep: number;
  maxSubSteps: number;
  _accumulator: number;
  // Emitter-instance pooling + cap (spec 01, Stage 1). Child emitter instances
  // recycle through per-node free-lists, but the System owns the global live cap
  // and instrumentation because child nodes aren't directly attached to it — the
  // tree walk (Stage 2) drives spawn/release through here where the System is in
  // scope. Counters are exposed for the sandbox HUD; the overflow warning fires
  // once so the cap is never silently hit.
  maxEmitterInstances: number;
  _liveEmitterInstances: number;
  _emitterPoolHits: number;
  _emitterPoolMisses: number;
  _warnedInstanceOverflow: boolean;
  // Hard recursion cap on the emitter tree (spec 01, Stage 2), enforced when an
  // emitter is added. Detached child instances outlive their dead parent to let
  // their particles drain (orphanPolicy 'detach'); the System advances them each
  // frame and releases them once empty.
  maxEmitterDepth: number;
  _detached: Emitter[];

  constructor(
    preParticles: number = POOL_MAX,
    integrationType: string = INTEGRATION_TYPE_EULER,
    seed: number = randomSeed()
  ) {
    this.type = type;
    this.canUpdate = true;
    this.preParticles = preParticles;
    this.integrationType = integrationType;
    this.emitters = [];
    this.renderers = [];
    this.pool = new Pool();
    this.eventDispatcher = new EventDispatcher();
    this.seed = seed;
    this.fixedTimeStep = DEFAULT_SYSTEM_DELTA;
    this.maxSubSteps = DEFAULT_MAX_SUB_STEPS;
    this._accumulator = 0;
    this.maxEmitterInstances = DEFAULT_MAX_EMITTER_INSTANCES;
    this._liveEmitterInstances = 0;
    this._emitterPoolHits = 0;
    this._emitterPoolMisses = 0;
    this._warnedInstanceOverflow = false;
    this.maxEmitterDepth = DEFAULT_MAX_DEPTH;
    this._detached = [];
  }

  /**
   * Acquires a child emitter instance of `node` bound to `parentParticle`,
   * honouring the global live-instance cap. On overflow the newest spawn is
   * dropped (the right default for FX) and a one-time warning is logged so the
   * cap is never hit silently. Returns the instance, or null when dropped.
   */
  spawnEmitterInstance(
    node: Emitter,
    parentParticle: Particle
  ): Emitter | null {
    if (this._liveEmitterInstances >= this.maxEmitterInstances) {
      if (!this._warnedInstanceOverflow) {
        this._warnedInstanceOverflow = true;
        // eslint-disable-next-line no-console
        console.warn(
          `three-nebula: maxEmitterInstances (${this.maxEmitterInstances}) reached; ` +
            `dropping newest child emitter instances. Raise System.maxEmitterInstances if intended.`
        );
      }

      return null;
    }

    const warm = node._freeInstances.length > 0;
    const inst = node.acquireInstance(parentParticle);

    // Parent the instance to the System (not the spawning emitter) so its own
    // createParticle/update dispatch through the System's event stream — the same
    // path top-level emitters use, so child particles reach the renderers (B1).
    inst.parent = this;

    warm ? this._emitterPoolHits++ : this._emitterPoolMisses++;
    this._liveEmitterInstances++;

    return inst;
  }

  /**
   * Releases a child emitter instance back to its node's free-list and updates
   * the live count. The caller guarantees the instance has drained its particles.
   */
  releaseEmitterInstance(inst: Emitter): void {
    (inst._template as Emitter).releaseInstance(inst);
    this._liveEmitterInstances--;
  }

  /**
   * Detaches a child instance from its dead parent: it stops emitting but keeps
   * updating so its already-emitted particles live out their lives, then is
   * released once drained (see `_updateDetached`). This is the `detach` policy.
   */
  _detachInstance(inst: Emitter): void {
    inst.isEmitting = false;
    inst._parentParticle = null;
    this._detached.push(inst);
  }

  /**
   * Kills a child instance with its parent (the `kill` policy): recursively kills
   * its own descendants, expires its particles (dispatching PARTICLE_DEAD so
   * renderers free them), then releases it immediately.
   */
  _killInstance(inst: Emitter): void {
    inst.isEmitting = false;

    if (inst.activeChildren.size) {
      inst.activeChildren.forEach(instances => {
        for (let i = 0; i < instances.length; i++) {
          this._killInstance(instances[i]);
        }
      });
      inst.activeChildren.clear();
    }

    let i = inst.particles.length;

    while (i--) {
      const particle = inst.particles[i];

      this.dispatch(PARTICLE_DEAD, particle);
      this.pool.expire(particle.reset());
    }

    inst.particles.length = 0;
    this.releaseEmitterInstance(inst);
  }

  /**
   * Advances detached instances (parents already dead) and releases each once it
   * has fully drained. Runs after the emitter walk so freshly-detached instances
   * still tick this frame. Flushes SYSTEM_UPDATE if any still hold particles so
   * renderer buffers pick up their movement.
   */
  _updateDetached(time: number): void {
    if (!this._detached.length) {
      return;
    }

    let flushed = false;
    let i = this._detached.length;

    while (i--) {
      const inst = this._detached[i];

      inst.update(time);

      if (inst.particles.length) {
        flushed = true;
      }

      if (inst.particles.length === 0 && inst.activeChildren.size === 0) {
        this._detached.splice(i, 1);
        this.releaseEmitterInstance(inst);
      }
    }

    if (flushed) {
      this.dispatch(SYSTEM_UPDATE);
    }
  }

  /**
   * Sets the system seed and re-derives every attached emitter's stream, so the
   * whole system becomes reproducible from this seed. Call before emitting for
   * fully deterministic output.
   */
  setSeed(seed: number): this {
    this.seed = seed;
    this.emitters.forEach((emitter, index) => emitter.reseed(seed, index));

    return this;
  }

  /**
   * Creates a System instance from a JSON object.
   *
   * @deprecated use fromJSONAsync instead
   */
  static fromJSON(json: SystemJSON, THREE: ThreeApi): System {
    return fromJSON(json, THREE, System, Emitter);
  }

  /**
   * Loads a System instance from JSON asynchronously. Ensures all textures are
   * fully loaded before resolving with the instantiated System instance.
   */
  static fromJSONAsync(
    json: SystemJSON,
    THREE: ThreeApi,
    options?: FromJSONAsyncOptions
  ): Promise<System> {
    return fromJSONAsync(json, THREE, System, Emitter, options);
  }

  /**
   * Proxy method for the internal event dispatcher's dispatchEvent method.
   */
  dispatch(event: string, target: unknown = this): void {
    this.eventDispatcher.dispatchEvent(event, target);
  }

  /**
   * Adds a renderer to the System instance and initializes it.
   */
  addRenderer(renderer: BaseRenderer): this {
    this.renderers.push(renderer);
    renderer.init(this);

    return this;
  }

  /**
   * Removes a renderer from the System instance.
   */
  removeRenderer(renderer: BaseRenderer): this {
    this.renderers.splice(this.renderers.indexOf(renderer), 1);
    renderer.remove(this);

    return this;
  }

  /**
   * Adds an emitter to the System instance. Dispatches the EMITTER_ADDED event.
   */
  addEmitter(emitter: Emitter): this {
    const index = this.emitters.length;

    emitter.parent = this;
    emitter.index = index;
    // Derive this emitter's deterministic seed from the system seed + its index
    // (stable across runs since emitters load in JSON order).
    emitter.reseed(this.seed, index);
    // Assign tree-path node ids across the whole subtree (and enforce the depth
    // cap) now that we know this emitter's root index.
    emitter._assignNodeIds(`${index}`, 0, this.maxEmitterDepth);

    this.emitters.push(emitter);
    this.dispatch(EMITTER_ADDED, emitter);

    return this;
  }

  /**
   * Removes an emitter from the System instance. Dispatches the EMITTER_REMOVED
   * event.
   */
  removeEmitter(emitter: Emitter): this {
    if (emitter.parent !== this) {
      return this;
    }

    emitter.parent = null;
    emitter.index = undefined;

    this.emitters.splice(this.emitters.indexOf(emitter), 1);
    this.dispatch(EMITTER_REMOVED, emitter);

    return this;
  }

  /**
   * Wires up life cycle methods and causes a system's emitters to emit particles.
   */
  emit({
    onStart,
    onUpdate,
    onEnd,
  }: LifeCycleHooks): Promise<unknown[]> | undefined {
    if (onStart) {
      onStart();
    }

    if (onUpdate) {
      this.eventDispatcher.addEventListener(SYSTEM_UPDATE, onUpdate);
    }

    const emitters = this.emitters.map(emitter => {
      const { life } = emitter;

      if (life === Infinity) {
        if (onEnd) {
          onEnd();
        }

        emitter.experimental_emit();

        return Promise.resolve();
      }

      return new Promise<void>(resolve => {
        emitter.addOnEmitterDeadEventListener(() => {
          if (onEnd) {
            onEnd();
          }

          resolve();
        });

        emitter.experimental_emit();
      });
    });

    try {
      return Promise.all(emitters);
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * Updates the particle system based on the delta passed.
   */
  update(delta: number = DEFAULT_SYSTEM_DELTA): Promise<void> {
    const d = delta || DEFAULT_SYSTEM_DELTA;

    if (this.canUpdate) {
      if (d > 0) {
        let i = this.emitters.length;

        while (i--) {
          const emitter = this.emitters[i];

          emitter.update(d);
          emitter.particles.length && this.dispatch(SYSTEM_UPDATE);
        }

        // Advance detached child instances (dead parents) so their particles
        // drain, then release the empty ones.
        this._updateDetached(d);
      }

      this.dispatch(SYSTEM_UPDATE_AFTER);
    }

    return Promise.resolve();
  }

  /**
   * Advances the simulation by the real elapsed time `realDt` (seconds),
   * consuming it in fixed `fixedTimeStep` increments (Stage 3 — the fixed-timestep
   * accumulator). Drive this from a `requestAnimationFrame` loop for playback that
   * is independent of the display's refresh rate; calling `update()` once per
   * frame instead ties simulation speed to how often it's called (2x on a 120Hz
   * display). Sub-steps are clamped to `maxSubSteps` per call so a long stall
   * (e.g. a backgrounded tab) can't spiral — excess time is dropped.
   *
   * This is the real-time driver, not a replacement for `update`: deterministic
   * stepping (headless render, seek, tests) should keep calling `update()`, which
   * remains the single-fixed-step primitive.
   */
  tick(realDt: number): Promise<void> {
    const { fixedTimeStep, maxSubSteps } = this;
    const promises: Promise<void>[] = [];

    this._accumulator += realDt;

    let steps = 0;

    while (this._accumulator >= fixedTimeStep && steps < maxSubSteps) {
      promises.push(this.update(fixedTimeStep));
      this._accumulator -= fixedTimeStep;
      steps++;
    }

    // Hit the clamp with time still owed — drop the backlog rather than spiral.
    if (steps === maxSubSteps && this._accumulator >= fixedTimeStep) {
      this._accumulator = 0;
    }

    return Promise.all(promises).then(() => undefined);
  }

  /**
   * Gets a count of the total number of particles in the system.
   */
  getCount(): number {
    const length = this.emitters.length;

    let total = 0;

    let i;

    for (i = 0; i < length; i++) {
      total += this.emitters[i].particles.length;
    }

    return total;
  }

  /**
   * Destroys all emitters, renderers and the Nebula pool.
   */
  destroy(): void {
    const length = this.emitters.length;

    this.canUpdate = false;

    for (let e = 0; e < length; e++) {
      this.emitters[e] && this.emitters[e].destroy();
      delete this.emitters[e];
    }

    for (let r = 0; r < length; r++) {
      if (this.renderers[r] && this.renderers[r].destroy) {
        this.renderers[r].destroy!();
        delete this.renderers[r];
      }
    }

    this.emitters.length = 0;
    this.pool.destroy();
    this.canUpdate = true;
  }
}
