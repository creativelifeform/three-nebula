import BaseRenderer from './BaseRenderer';
import { Vector3 } from 'three';
import { classDeprecationWarning } from '../compatibility';

export default class PointsRenderer extends BaseRenderer {
  constructor(ps) {
    super();

    this.points = ps;
  }

  onProtonUpdate() {}

  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = new Vector3();
    }

    particle.target.copy(particle.p);
    this.points.geometry.vertices.push(particle.target);
  }

  onParticleUpdate(particle) {
    if (particle.target) {
      particle.target.copy(particle.p);
    }
  }

  onParticleDead(particle) {
    if (particle.target) {
      var index = this.points.geometry.vertices.indexOf(particle.target);

      if (index > -1) this.points.geometry.vertices.splice(index, 1);

      particle.target = null;
    }
  }
}

export class PointsRender extends PointsRenderer {
  constructor(...args) {
    super(...args);
    console.warn(classDeprecationWarning('PointsRender', 'PointsRenderer'));
  }
}
