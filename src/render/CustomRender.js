import BaseRender from './BaseRender';
import { Pool } from '../core';

export default class CustomRender extends BaseRender {
  constructor() {
    super();

    this.targetPool = new Pool();
    this.materialPool = new Pool();

    this.name = 'CustomRender';
  }

  onProtonUpdate() {}

  onParticleCreated(particle) {} // eslint-disable-line

  onParticleUpdate(particle) {} // eslint-disable-line

  onParticleDead(particle) {} // eslint-disable-line
}
