import BaseRenderer from './BaseRenderer';
import { Pool } from '../core';

export default class CustomRenderer extends BaseRenderer {
  constructor() {
    super();

    this.targetPool = new Pool();
    this.materialPool = new Pool();
  }

  onProtonUpdate() {}

  onParticleCreated(particle) {} // eslint-disable-line

  onParticleUpdate(particle) {} // eslint-disable-line

  onParticleDead(particle) {} // eslint-disable-line
}
