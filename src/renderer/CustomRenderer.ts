import BaseRenderer from './BaseRenderer';
import { Pool } from '../core';
import { RENDERER_TYPE_CUSTOM as type } from './types';
import type Particle from '../core/Particle';

export default class CustomRenderer extends BaseRenderer {
  targetPool: Pool;
  materialPool: Pool;

  constructor() {
    super(type);

    this.targetPool = new Pool();
    this.materialPool = new Pool();
  }

  onSystemUpdate(): void {}

  onParticleCreated(particle: Particle): void {} // eslint-disable-line

  onParticleUpdate(particle: Particle): void {} // eslint-disable-line

  onParticleDead(particle: Particle): void {} // eslint-disable-line
}
