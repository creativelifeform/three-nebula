import {
  DEFAULT_AGE,
  DEFAULT_ALPHA,
  DEFAULT_BODY,
  DEFAULT_DEAD,
  DEFAULT_EASING,
  DEFAULT_ENERGY,
  DEFAULT_LIFE,
  DEFAULT_MASS,
  DEFAULT_PARENT,
  DEFAULT_RADIUS,
  DEFAULT_SCALE,
  DEFAULT_SLEEP,
  DEFAULT_USE_ALPHA,
  DEFAULT_USE_COLOR,
} from './constants';
import { Util, uid } from '../utils';

import { PI } from '../constants';
import { Vector3D } from '../math';
import { CORE_TYPE_PARTICLE as type } from './types';
import type { EasingFunction } from '../ease';
import type Behaviour from '../behaviour/Behaviour';
import type Emitter from '../emitter/Emitter';

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * A Particle is an object that is emitted by an emitter.
 */
export default class Particle {
  id: string;
  type: string;
  life: number;
  age: number;
  energy: number;
  dead: boolean;
  sleep: boolean;
  body: unknown;
  parent: Emitter | null;
  mass: number;
  radius: number;
  alpha: number;
  scale: number;
  useColor: boolean;
  useAlpha: boolean;
  easing: EasingFunction;
  position: Vector3D;
  velocity: Vector3D;
  acceleration: Vector3D;
  old: { position: Vector3D; velocity: Vector3D; acceleration: Vector3D };
  behaviours: Behaviour[];
  transform: Record<string, unknown>;
  color: RGB;
  rotation: Vector3D;
  distanceToCamera: number;
  hasBeenInitialized?: boolean;

  /**
   * Constructs a Particle instance.
   *
   * @param properties - The properties to instantiate the particle with
   */
  constructor(properties: Record<string, unknown> = {}) {
    this.id = `particle-${uid()}`;
    this.type = type;
    this.life = DEFAULT_LIFE;
    this.age = DEFAULT_AGE;
    this.energy = DEFAULT_ENERGY;
    this.dead = DEFAULT_DEAD;
    this.sleep = DEFAULT_SLEEP;
    this.body = DEFAULT_BODY;
    this.parent = DEFAULT_PARENT;
    this.mass = DEFAULT_MASS;
    this.radius = DEFAULT_RADIUS;
    this.alpha = DEFAULT_ALPHA;
    this.scale = DEFAULT_SCALE;
    this.useColor = DEFAULT_USE_COLOR;
    this.useAlpha = DEFAULT_USE_ALPHA;
    this.easing = DEFAULT_EASING;
    this.position = new Vector3D();
    this.velocity = new Vector3D();
    this.acceleration = new Vector3D();
    this.old = {
      position: this.position.clone(),
      velocity: this.velocity.clone(),
      acceleration: this.acceleration.clone(),
    };
    this.behaviours = [];
    this.transform = {};
    this.color = { r: 0, g: 0, b: 0 };
    this.rotation = new Vector3D();

    /**
     * @desc The particle's distance to the camera, only set by the GPURenderer
     * for depth sorting purposes.
     */
    this.distanceToCamera = 0;

    // override constructor props with passed properties.
    Util.setPrototypeByObj(this, properties);
  }

  /**
   * Gets the particle's current direction.
   */
  getDirection(): number {
    return Math.atan2(this.velocity.x, -this.velocity.y) * (180 / PI);
  }

  /**
   * Resets the particle's default properties and clears its position,
   * velocity, acceleration, color and rotation.
   */
  reset(): this {
    this.life = DEFAULT_LIFE;
    this.age = DEFAULT_AGE;
    this.energy = DEFAULT_ENERGY;
    this.dead = DEFAULT_DEAD;
    this.sleep = DEFAULT_SLEEP;
    this.body = DEFAULT_BODY;
    this.parent = DEFAULT_PARENT;
    this.mass = DEFAULT_MASS;
    this.radius = DEFAULT_RADIUS;
    this.alpha = DEFAULT_ALPHA;
    this.scale = DEFAULT_SCALE;
    this.useColor = DEFAULT_USE_COLOR;
    this.useAlpha = DEFAULT_USE_ALPHA;
    this.easing = DEFAULT_EASING;
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.acceleration.set(0, 0, 0);
    this.old.position.set(0, 0, 0);
    this.old.velocity.set(0, 0, 0);
    this.old.acceleration.set(0, 0, 0);
    this.color.r = 0;
    this.color.g = 0;
    this.color.b = 0;

    this.rotation.clear();
    Util.destroyObject(this.transform);
    this.removeAllBehaviours();

    return this;
  }

  /**
   * Updates the particle's properties by applying each behaviour to it.
   */
  update(time: number, index?: number): void {
    if (!this.sleep) {
      this.age += time;

      let i = this.behaviours.length;

      while (i--) {
        let behaviour = this.behaviours[i];

        behaviour.applyBehaviour(this, time, index);
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
   */
  addBehaviour(behaviour: Behaviour): void {
    this.behaviours.push(behaviour);
    behaviour.initialize(this);
  }

  /**
   * Adds multiple behaviours to the particle.
   */
  addBehaviours(behaviours: Behaviour[]): void {
    let i = behaviours.length;

    while (i--) {
      this.addBehaviour(behaviours[i]);
    }
  }

  /**
   * Removes the behaviour from the particle.
   */
  removeBehaviour(behaviour: Behaviour): void {
    const index = this.behaviours.indexOf(behaviour);

    if (index > -1) {
      this.behaviours.splice(index, 1);
    }
  }

  /**
   * Removes all behaviours from the particle.
   */
  removeAllBehaviours(): void {
    Util.destroyArray(this.behaviours);
  }

  /**
   * Destroys the particle.
   */
  destroy(): void {
    this.removeAllBehaviours();
    this.energy = 0;
    this.dead = true;
    this.parent = null;
  }
}
