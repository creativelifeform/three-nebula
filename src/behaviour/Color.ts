import { ColorSpan, MathUtils, createColorSpan } from '../math';

import Behaviour from './Behaviour';
import { ColorUtil } from '../utils';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_COLOR as type } from './types';
import type { EasingFunction } from '../ease';
import type Particle from '../core/Particle';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ColorJSON {
  colorA: string;
  colorB?: string;
  life?: number;
  easing?: string;
  isEnabled?: boolean;
}

/**
 * A behaviour which mutates the color of a particle over time.
 *
 */
export default class Color extends Behaviour {
  colorA: ColorSpan;
  colorB: ColorSpan;
  _same: boolean;

  /**
   * Constructs a Color behaviour instance.
   *
   * @param colorA - the starting color
   * @param colorB - the ending color
   * @param life - the life of the particle
   * @param easing - The behaviour's decaying trend
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    colorA?: string,
    colorB?: string,
    life?: number,
    easing?: EasingFunction,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    this.reset(colorA, colorB);
  }

  /**
   * Gets the _same property which determines if the alpha are the same.
   */
  get same(): boolean {
    return this._same;
  }

  /**
   * Sets the _same property which determines if the alpha are the same.
   */
  set same(same: boolean) {
    this._same = same;
  }

  reset(
    colorA?: string,
    colorB?: string,
    life?: number,
    easing?: EasingFunction
  ): void {
    this.same = colorB === null || colorB === undefined ? true : false;

    this.colorA = createColorSpan(colorA);
    this.colorB = createColorSpan(colorB);
    life && super.reset(life, easing);
  }

  initialize(particle: Particle): void {
    particle.transform.colorA = ColorUtil.getRGB(this.colorA.getValue());

    particle.useColor = true;
    particle.transform.colorB = this.same
      ? particle.transform.colorA
      : ColorUtil.getRGB(this.colorB.getValue());
  }

  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    if (!this._same) {
      particle.color.r = MathUtils.lerp(
        (particle.transform.colorA as RGB).r,
        (particle.transform.colorB as RGB).r,
        this.energy
      );
      particle.color.g = MathUtils.lerp(
        (particle.transform.colorA as RGB).g,
        (particle.transform.colorB as RGB).g,
        this.energy
      );
      particle.color.b = MathUtils.lerp(
        (particle.transform.colorA as RGB).b,
        (particle.transform.colorB as RGB).b,
        this.energy
      );
    } else {
      particle.color.r = (particle.transform.colorA as RGB).r;
      particle.color.g = (particle.transform.colorA as RGB).g;
      particle.color.b = (particle.transform.colorA as RGB).b;
    }
  }

  /**
   * Creates a Color initializer from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: ColorJSON): Color {
    const { colorA, colorB, life, easing, isEnabled = true } = json;

    return new Color(colorA, colorB, life, getEasingByName(easing), isEnabled);
  }
}
