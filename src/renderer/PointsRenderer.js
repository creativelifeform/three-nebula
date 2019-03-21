import BaseRenderer from './BaseRenderer';
import { Vector3 } from '../core/three';
import { RENDERER_TYPE_POINTS as type } from './types';

export default class PointsRenderer extends BaseRenderer {
  constructor(ps) {
    super(type);

    this.points = ps;
  }

  onProtonUpdate() {}

  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = new Vector3();
    }

    particle.target.copy(particle.position);
    this.points.geometry.vertices.push(particle.target);
  }

  onParticleUpdate(particle) {
    if (particle.target) {
      particle.target.copy(particle.position);
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
