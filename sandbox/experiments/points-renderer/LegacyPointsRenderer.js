const { CustomRenderer } = window.Nebula;
const { safeLog } = window;

window.PointsRenderer = class extends CustomRenderer {
  constructor(container, points) {
    super();

    container.add(points);

    this.points = points;
    this.points.fustrumCulled = false;
  }

  onSystemUpdate() {}

  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = new THREE.Vector3();
    }

    particle.target.copy(particle.position);
    this.points.geometry.vertices.push(particle.target);
  }

  onParticleUpdate(particle) {
    if (particle.target) {
      particle.target.copy(particle.position);
    }

    this.points.geometry.verticesNeedUpdate = true;

    safeLog(this.points.geometry.vertices.length);
  }

  onParticleDead(particle) {
    if (particle.target) {
      var index = this.points.geometry.vertices.indexOf(particle.target);

      if (index > -1) this.points.geometry.vertices.splice(index, 1);

      particle.target = null;
    }

    safeLog(this.points.geometry.vertices.length);
  }
};
