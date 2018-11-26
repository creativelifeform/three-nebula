import BaseRenderer from './BaseRenderer';
import { Pool } from '../core';
import { classDeprecationWarning } from '../compatibility';

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

export class CustomRender extends CustomRenderer {
  constructor(...args) {
    super(...args);
    console.warn(classDeprecationWarning('CustomRender', 'CustomRenderer'));
  }
}
