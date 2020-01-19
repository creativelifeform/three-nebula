const { System, CustomRenderer, SpriteRenderer } = window.Nebula;

const LOG_MAX = 10;
let loggedTimes = 0;

const safeLog = message => {
  if (loggedTimes <= LOG_MAX) {
    console.log(message);
  }

  loggedTimes++;
};

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

window.init = async ({ scene, camera, renderer }) => {
  const { particleSystemState } = window.SYSTEM;
  const points = new THREE.Points(
    new THREE.Geometry(),
    new THREE.PointsMaterial({ color: 0xffffff, size: 5 })
  );
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const pointsRenderer = new window.PointsRenderer(scene, points);
  const systemRenderer = pointsRenderer;
  const system = await System.fromJSONAsync(particleSystemState, THREE, {
    shouldAutoEmit: true,
  });

  return system.addRenderer(systemRenderer);
};
