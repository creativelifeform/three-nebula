import BaseRenderer from './BaseRenderer';
import { Pool } from '../core';
import { RENDERER_TYPE_CUSTOM as type } from './types';

export default class CustomRenderer extends BaseRenderer {
  constructor() {
    super(type);

    this.targetPool = new Pool();
    this.materialPool = new Pool();
  }

  onSystemUpdate() {}

  onParticleCreated(particle) {} // eslint-disable-line

  onParticleUpdate(particle) {} // eslint-disable-line

  onParticleDead(particle) {} // eslint-disable-line
}
