import {
  DEFAULT_BEHAVIOUR_EASING,
  DEFAULT_CURL_NOISE_EPSILON,
  DEFAULT_CURL_NOISE_SCALE,
  DEFAULT_CURL_NOISE_SEED,
  DEFAULT_CURL_NOISE_STRENGTH,
  DEFAULT_LIFE,
} from './constants';

import Behaviour from './Behaviour';
import { Vector3D } from '../math';
import { mulberry32 } from '../math/rng';
import { getEasingByName } from '../ease';
import { BEHAVIOUR_TYPE_CURL_NOISE as type } from './types';
import type { EasingFunction, EaseName } from '../ease';
import type Particle from '../core/Particle';

interface CurlNoiseJSON {
  scale: number;
  strength: number;
  seed: number;
  life?: number;
  easing?: EaseName | (string & {});
  isEnabled?: boolean;
}

const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number): number => a + t * (b - a);

// Ken Perlin's improved-noise gradient (low 4 bits of the hash pick a direction).
const grad = (hash: number, x: number, y: number, z: number): number => {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;

  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};

/**
 * Seeded 3D Perlin noise — a shuffled 0..255 permutation (from the seeded
 * mulberry32 stream), doubled to 512.
 */
class PerlinNoise {
  perm: Uint8Array;

  constructor(seed: number) {
    const rng = mulberry32(seed);
    const p = new Uint8Array(256);

    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Fisher-Yates shuffle from the seeded stream.
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = p[i];

      p[i] = p[j];
      p[j] = t;
    }

    this.perm = new Uint8Array(512);

    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  noise(x: number, y: number, z: number): number {
    const p = this.perm;
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(
      w,
      lerp(
        v,
        lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
        lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
      ),
      lerp(
        v,
        lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
        lerp(
          u,
          grad(p[AB + 1], x, y - 1, z - 1),
          grad(p[BB + 1], x - 1, y - 1, z - 1)
        )
      )
    );
  }
}

// Fixed offsets that decorrelate the three components of the vector potential.
const OFFSET_Y = new Vector3D(31.416, 47.853, 12.793);
const OFFSET_Z = new Vector3D(71.123, 13.547, 91.371);

/**
 * Behaviour that drives particles with the **curl of a seeded noise field** — the
 * standard for organic, roiling turbulence (smoke, fire, dust, energy). Because
 * the field is the curl of a vector potential it is divergence-free, so particles
 * swirl and fold without clumping or thinning.
 *
 * Like `Vortex`, it is applied to the particle's **velocity** (not acceleration),
 * so it is not subject to the `Force` 1:100 (MEASURE) scaling. It is
 * **deterministic**: the field is built once from `seed` via the seeded PRNG
 * (spec 02's mulberry32), never `Math.random`, so the same seed yields the same
 * flow on every machine.
 */
export default class CurlNoise extends Behaviour {
  scale: number;
  strength: number;
  seed: number;

  private _noise: PerlinNoise;
  private _curl: Vector3D;
  private _pxp: Vector3D;
  private _pxm: Vector3D;
  private _pyp: Vector3D;
  private _pym: Vector3D;
  private _pzp: Vector3D;
  private _pzm: Vector3D;

  /**
   * Constructs a CurlNoise behaviour instance.
   *
   * @param scale - Spatial frequency of the field (samples position × scale)
   * @param strength - Velocity magnitude imparted by the field
   * @param seed - Seed for the (deterministic) noise field
   * @param life - The life of the behaviour
   * @param easing - The behaviour's decaying trend
   * @param isEnabled - Determines if the behaviour will be applied or not
   */
  constructor(
    scale: number = DEFAULT_CURL_NOISE_SCALE,
    strength: number = DEFAULT_CURL_NOISE_STRENGTH,
    seed: number = DEFAULT_CURL_NOISE_SEED,
    life: number = DEFAULT_LIFE,
    easing: EasingFunction = DEFAULT_BEHAVIOUR_EASING,
    isEnabled: boolean = true
  ) {
    super(life, easing, type, isEnabled);

    /**
     * @desc Spatial frequency of the field
     */
    this.scale = scale;

    /**
     * @desc Velocity magnitude imparted by the field
     */
    this.strength = strength;

    /**
     * @desc Seed for the deterministic noise field
     */
    this.seed = seed;

    this._noise = new PerlinNoise(seed);

    // Scratch vectors reused each mutate to avoid per-particle allocation.
    this._curl = new Vector3D();
    this._pxp = new Vector3D();
    this._pxm = new Vector3D();
    this._pyp = new Vector3D();
    this._pym = new Vector3D();
    this._pzp = new Vector3D();
    this._pzm = new Vector3D();
  }

  /**
   * Resets the behaviour properties.
   */
  reset(
    scale: number = DEFAULT_CURL_NOISE_SCALE,
    strength: number = DEFAULT_CURL_NOISE_STRENGTH,
    seed: number = DEFAULT_CURL_NOISE_SEED,
    life?: number,
    easing?: EasingFunction
  ): void {
    this.scale = scale;
    this.strength = strength;

    if (seed !== this.seed) {
      this.seed = seed;
      this._noise = new PerlinNoise(seed);
    }

    life && super.reset(life, easing);
  }

  // The vector potential Ψ(p) = (n(p), n(p + off_y), n(p + off_z)).
  private _potential(x: number, y: number, z: number, out: Vector3D): Vector3D {
    const n = this._noise;

    out.set(
      n.noise(x, y, z),
      n.noise(x + OFFSET_Y.x, y + OFFSET_Y.y, z + OFFSET_Y.z),
      n.noise(x + OFFSET_Z.x, y + OFFSET_Z.y, z + OFFSET_Z.z)
    );

    return out;
  }

  /**
   * Mutates the particle's velocity by the curl of the noise field.
   *
   * @param particle - the particle to apply the behaviour to
   * @param time - particle engine time
   * @param index - the particle index
   */
  mutate(particle: Particle, time: number, index?: number): void {
    this.energize(particle, time, index);

    const s = this.scale;
    const e = DEFAULT_CURL_NOISE_EPSILON;
    const x = particle.position.x * s;
    const y = particle.position.y * s;
    const z = particle.position.z * s;

    // Central differences of the vector potential about the sample point.
    const pxp = this._potential(x + e, y, z, this._pxp);
    const pxm = this._potential(x - e, y, z, this._pxm);
    const pyp = this._potential(x, y + e, z, this._pyp);
    const pym = this._potential(x, y - e, z, this._pym);
    const pzp = this._potential(x, y, z + e, this._pzp);
    const pzm = this._potential(x, y, z - e, this._pzm);

    const inv = 1 / (2 * e);

    // curl Ψ = ( ∂Ψz/∂y − ∂Ψy/∂z, ∂Ψx/∂z − ∂Ψz/∂x, ∂Ψy/∂x − ∂Ψx/∂y )
    this._curl.set(
      (pyp.z - pym.z - (pzp.y - pzm.y)) * inv,
      (pzp.x - pzm.x - (pxp.z - pxm.z)) * inv,
      (pxp.y - pxm.y - (pyp.x - pym.x)) * inv
    );

    particle.velocity.addScaledVector(this._curl, this.strength * time);
  }

  /**
   * Creates a CurlNoise behaviour from JSON.
   *
   * @param json - The JSON to construct the instance from.
   */
  static fromJSON(json: CurlNoiseJSON): CurlNoise {
    const { scale, strength, seed, life, easing, isEnabled = true } = json;

    return new CurlNoise(
      scale,
      strength,
      seed,
      life,
      getEasingByName(easing),
      isEnabled
    );
  }
}
