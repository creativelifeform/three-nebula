const { CustomRenderer } = window.Nebula;

const RENDERER_TYPE_POINTS_RENDERER = 'PointsRenderer';

let loggedCount = 0;
const MAX = 1;
const log = (message, id) => {
  loggedCount < MAX && console.log(message, id);

  loggedCount++;
};

/**
 * Performant particle renderer that uses THREE.Points to propagate particle (postiion, rgba etc.,) properties to
 * vertices in a ParticleBufferGeometry.
 */
window.PointsRenderer = class extends CustomRenderer {
  constructor(container, { size, maxParticles = undefined }) {
    super(RENDERER_TYPE_POINTS_RENDERER);

    const geometry = new window.ParticleBufferGeometry({ maxParticles });
    const material = new THREE.PointsMaterial({
      size,
      vertexColors: THREE.VertexColors,
    });

    this.points = new THREE.Points(geometry, material);

    container.add(this.points);
  }

  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = new THREE.Vector3();
    }

    particle.target.copy(particle.position);
    // this.mapParticlePropsToPoint(particle);
  }

  onParticleUpdate(particle) {
    if (particle.target) {
      particle.target.copy(particle.position);
    }

    this.mapParticlePropsToPoint(particle);
  }

  onParticleDead(particle) {
    loggedCount = 0;
    // if (particle.target) {
    //   particle.target = null;
    // }
  }

  mapParticlePropsToPoint(particle) {
    this.updatePointPosition(particle);
  }

  randomisePointPositions(positionBuffer) {
    const { array } = positionBuffer;

    for (let i = 0; i < array.length; i++) {
      array[i] = (Math.random() - 0.5) * 20;
    }
  }

  updatePointPosition(particle) {
    const { geometry } = this;
    const {
      positionBufferOffset: attributeOffset,
      buffers: { positionBuffer },
    } = geometry;
    const { x, y, z } = particle.target;
    const { index: particleIndex } = particle;

    log('UPDATING', particleIndex);

    positionBuffer.array[particleIndex + (attributeOffset + 0)] = x;
    positionBuffer.array[particleIndex + (attributeOffset + 1)] = y;
    positionBuffer.array[particleIndex + (attributeOffset + 2)] = z;

    geometry.attributes.position.data.needsUpdate = true;
    geometry.computeBoundingSphere();

    return this;
  }

  updatePointRgba(particle) {
    // TODO
    return this;
  }

  get geometry() {
    return this.points.geometry;
  }
};
