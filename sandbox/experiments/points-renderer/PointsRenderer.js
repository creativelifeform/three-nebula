const { CustomRenderer } = window.Nebula;

const RENDERER_TYPE_POINTS_RENDERER = 'PointsRenderer';

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
    this.mapParticlePropsToPoint(particle);
  }

  onParticleUpdate(particle) {
    if (particle.target) {
      particle.target.copy(particle.position);
    }

    this.mapParticlePropsToPoint(particle);
  }

  // onParticleDead(particle) {
  //   if (particle.target) {
  //     var index = this.points.geometry.vertices.indexOf(particle.target);
  //
  //     if (index > -1) this.points.geometry.vertices.splice(index, 1);
  //
  //     particle.target = null;
  //   }
  // }

  mapParticlePropsToPoint(particle) {
    this.updatePointPosition(particle).updatePointRgba(particle);
  }

  updatePointPosition(particle) {
    const { geometry } = this;
    const {
      positionBufferOffset,
      buffers: { positionBuffer },
    } = geometry;
    const { x, y, z } = particle.target;
    const { __poolIndex: i } = particle;

    // const { array } = positionBuffer;
    //
    // for (let i = 0; i < array.length; i++) {
    //   array[i] = (Math.random() - 0.5) * 20;
    // }

    positionBuffer.array[i + positionBufferOffset] = x;
    positionBuffer.array[i + (positionBufferOffset + 1)] = y;
    positionBuffer.array[i + (positionBufferOffset + 2)] = z;

    window.safeLog(i);

    geometry.attributes.position.needsUpdate = true;
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
