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
import fromJSON, { SystemJSON } from './fromJSON';
import fromJSONAsync from './fromJSONAsync';
import { CORE_TYPE_SYSTEM as type } from './types';
import type BaseRenderer from '../renderer/BaseRenderer';
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

  constructor(
    preParticles: number = POOL_MAX,
    integrationType: string = INTEGRATION_TYPE_EULER
  ) {
    this.type = type;
    this.canUpdate = true;
    this.preParticles = preParticles;
    this.integrationType = integrationType;
    this.emitters = [];
    this.renderers = [];
    this.pool = new Pool();
    this.eventDispatcher = new EventDispatcher();
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
      }

      this.dispatch(SYSTEM_UPDATE_AFTER);
    }

    return Promise.resolve();
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
