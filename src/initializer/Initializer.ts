import { INITIALIZER_TYPE_ABSTRACT } from './types';
import type Particle from '../core/Particle';
import type Emitter from '../emitter/Emitter';

/**
 * The base Emitter / Particle property class.
 *
 * @abstract
 */
export default class Initializer {
  type: string;
  isEnabled: boolean;

  constructor(
    type: string = INITIALIZER_TYPE_ABSTRACT,
    isEnabled: boolean = true
  ) {
    this.type = type;
    this.isEnabled = isEnabled;
  }

  /**
   * Initializes the property on the emitter or particle.
   */
  init(emitter: Emitter, particle?: Particle): void {
    if (!this.isEnabled) {
      return;
    }

    if (particle) {
      this.initialize(particle);
      particle.hasBeenInitialized = true;
    } else {
      this.initialize(emitter);
      emitter.hasBeenInitialized = true;
    }
  }

  /**
   * @abstract
   */
  reset(): void {}

  /**
   * Place custom property initialization code in this method in the subclass.
   *
   * @abstract
   */
  initialize(target: Emitter | Particle): void {} // eslint-disable-line

  /**
   * Determines if the initializer requires a WebGL API to be provided to its
   * constructor.
   */
  static requiresWebGlApi(): boolean {
    return false;
  }

  /**
   * Returns a new instance of the initializer from the JSON object passed.
   *
   * @abstract
   */
  static fromJSON(json: Record<string, unknown>): Initializer | void {} // eslint-disable-line
}
