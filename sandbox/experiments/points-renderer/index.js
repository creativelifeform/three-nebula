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
  constructor(points) {
    super();

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
  const geometry = new THREE.Geometry();
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 4 });
  const spriteRenderer = new SpriteRenderer(scene, THREE);
  const pointsRenderer = new PointsRenderer(
    new THREE.Points(geometry, material)
  );
  const systemRenderer = pointsRenderer;
  const system = await System.fromJSONAsync(SYSTEM.particleSystemState, THREE, {
    shouldAutoEmit: true,
  });

  return system.addRenderer(systemRenderer);
};
