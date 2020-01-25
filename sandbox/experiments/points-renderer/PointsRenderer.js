const { CustomRenderer, Pool } = window.Nebula;

const RENDERER_TYPE_POINTS_RENDERER = 'PointsRenderer';

window.Target = class {
  constructor() {
    this.position = new THREE.Vector3();
    this.scale = new THREE.Vector3();
  }
};

/**
 * Performant particle renderer that uses THREE.Points to propagate particle (postiion, rgba etc.,) properties to
 * vertices in a ParticleBufferGeometry.
 *
 */
window.PointsRenderer = class extends CustomRenderer {
  constructor(container, { size, maxParticles = undefined }) {
    super(RENDERER_TYPE_POINTS_RENDERER);

    const geometry = new window.ParticleBufferGeometry({ maxParticles });
    const material = new THREE.PointsMaterial({
      size,
      vertexColors: THREE.VertexColors,
    });

    this.geometry = geometry;
    this.targetPool = new Pool();
    this.texturePool = new Pool();
    this.points = new THREE.Points(geometry, material);

    container.add(this.points);
  }

  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = this.targetPool.get(window.Target);
    }

    particle.target.position.copy(particle.position);
    this.mapParticlePropsToPoint(particle);
  }

  onParticleUpdate(particle) {
    if (particle.target) {
      particle.target.position.copy(particle.position);
      this.mapParticlePropsToPoint(particle);
    }
  }

  onParticleDead(particle) {
    if (particle.target) {
      this.mapParticlePropsToPoint(particle);
      particle.target = null;
    }
  }

  /**
   * Entry point for mapping particle properties to buffer geometry points.
   *
   * @param {Particle} particle - The particle containing the properties to map
   * @return void
   */
  mapParticlePropsToPoint(particle) {
    this.updatePointPosition(particle)
      .updatePointSize(particle)
      .updatePointRgba(particle);
  }

  /**
   * Updates the particle buffer geometry point's position relative to the particle.
   *
   * @param {Particle} particle - The particle containing the target position.
   * @return {PointsRenderer}
   */
  updatePointPosition(particle) {
    const { geometry } = this;
    const { positionBufferStride, buffers } = geometry;
    const { target, index } = particle;
    const { array } = buffers.positionBuffer;

    array[index * positionBufferStride + 0] = target.position.x;
    array[index * positionBufferStride + 1] = target.position.y;
    array[index * positionBufferStride + 2] = target.position.z;

    geometry.attributes.position.data.needsUpdate = true;

    return this;
  }

  /**
   * Updates the particle buffer geometry point's size relative to the particle scale.
   *
   * @param {Particle} particle - The particle containing the target scale.
   * @return {PointsRenderer}
   */
  updatePointSize(particle) {
    // TODO
    return this;
  }

  /**
   * Updates the particle buffer geometry rgba values relative to the particle color and alpha properties.
   *
   * @param {Particle} particle - The particle containing the target color and alpha.
   * @return {PointsRenderer}
   */
  updatePointRgba(particle) {
    // TODO
    return this;
  }
};
