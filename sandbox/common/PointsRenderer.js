const { CustomRenderer, Pool } = window.Nebula;

const RENDERER_TYPE_POINTS_RENDERER = 'PointsRenderer';
const DEFAULT_RENDERER_PROPS = {
  blending: 'AdditiveBlending',
  baseColor: 0xffffff,
  depthTest: false,
  transparent: true,
  maxParticles: undefined,
};

const vertexShader = () => {
  const SIZE_ATTENUATION_FACTOR = '600.0';

  return `
    attribute float size;
    attribute vec3 color;
    attribute float alpha;

    varying vec3 targetColor;
    varying float targetAlpha;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      targetColor = color;
      targetAlpha = alpha;

      gl_PointSize = size * (${SIZE_ATTENUATION_FACTOR} / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
`;
};

const fragmentShader = () => {
  return `
    uniform vec3 baseColor;
    uniform sampler2D texture;

    varying vec3 targetColor;
    varying float targetAlpha;

    void main() {
      gl_FragColor = vec4(baseColor * targetColor, targetAlpha);
      gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);
    }
`;
};

/**
 * Simple class that stores the particle's "target" or "next" state.
 */
class Target {
  constructor() {
    this.position = new THREE.Vector3();
    this.size = 0;
    this.color = new THREE.Color();
    this.alpha = 0;
    this.texture = null;
    this.index = 0;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.size = 0;
    this.color.setRGB(0, 0, 0);
    this.alpha = 0;
    this.texture = null;
  }
}

class UniqueList {
  constructor(max = Infinity) {
    this.max = max;
    this.items = [];
  }

  add(item) {
    if (this.has(item)) {
      return;
    }

    if (this.items.length + 1 === this.max) {
      throw new RangeError('UniqueList max size exceeded');
    }

    this.items.push(item);
  }

  has(item) {
    return this.items.indexOf(item) > 0;
  }

  find(item) {
    return this.items.indexOf(item);
  }
}

/**
 * Performant particle renderer that uses THREE.Points to propagate particle (postiion, rgba etc.,) properties to
 * vertices in a ParticleBufferGeometry.
 *
 * @author thrax <manthrax@gmail.com>
 * @author rohan-deshpande <rohan@creativelifeform.com>
 */
window.PointsRenderer = class extends CustomRenderer {
  constructor(container, options = DEFAULT_RENDERER_PROPS) {
    super(RENDERER_TYPE_POINTS_RENDERER);

    console.log('USING POINTS RENDERER');

    const props = { ...DEFAULT_RENDERER_PROPS, ...options };
    const { maxParticles, baseColor, blending, depthTest, transparent } = props;
    const geometry = new window.ParticleBufferGeometry({ maxParticles });
    const material = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(baseColor) },
        texture: { value: null },
      },
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      blending: THREE[blending],
      depthTest,
      transparent,
    });

    this.uniqueList = new UniqueList(maxParticles);
    this.geometry = geometry;
    this.material = material;
    this.points = new THREE.Points(geometry, material);

    container.add(this.points);
  }

  /**
   * Maps all mutable properties from the particle to the target.
   *
   * @param {Particle}
   * @return {PointsRenderer}
   */
  updateTarget(particle) {
    const { position, scale, radius, color, alpha, body, id } = particle;
    const { r, g, b } = color;

    particle.target.position.copy(position);
    particle.target.size = scale * radius;
    particle.target.color.setRGB(r, g, b);
    particle.target.alpha = alpha;
    particle.target.index = this.uniqueList.find(id);

    if (body && body instanceof THREE.Sprite) {
      particle.target.texture = body.material.map;
      this.material.uniforms.texture = { value: particle.target.texture };
    }

    return this;
  }

  /**
   * Entry point for mapping particle properties to buffer geometry points.
   *
   * @param {Particle} particle - The particle containing the properties to map
   * @return {PointsRenderer}
   */
  mapParticleTargetPropsToPoint(particle) {
    this.updatePointPosition(particle)
      .updatePointSize(particle)
      .updatePointColor(particle)
      .updatePointAlpha(particle)
      .ensurePointUpdatesAreRendered();

    return this;
  }

  /**
   * Updates the point's position according to the particle's target position.
   *
   * @param {Particle} particle - The particle containing the target position.
   * @return {PointsRenderer}
   */
  updatePointPosition(particle) {
    const attribute = 'position';
    const { geometry } = this;
    const { stride, buffer } = geometry;
    const { target, index } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.position.x;
    buffer.array[target.index * stride + offset + 1] = target.position.y;
    buffer.array[target.index * stride + offset + 2] = target.position.z;

    return this;
  }

  /**
   * Updates the point's size relative to the particle's target scale and radius.
   *
   * @param {Particle} particle - The particle containing the target scale.
   * @return {PointsRenderer}
   */
  updatePointSize(particle) {
    const attribute = 'size';
    const { geometry } = this;
    const { stride, buffer } = geometry;
    const { target, index } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.size;

    return this;
  }

  /**
   * Updates the point's color attribute according with the particle's target color.
   *
   * @param {Particle} particle - The particle containing the target color and alpha.
   * @return {PointsRenderer}
   */
  updatePointColor(particle) {
    const attribute = 'color';
    const { geometry } = this;
    const { stride, buffer } = geometry;
    const { target, index } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.color.r;
    buffer.array[target.index * stride + offset + 1] = target.color.g;
    buffer.array[target.index * stride + offset + 2] = target.color.b;

    return this;
  }

  /**
   * Updates the point alpha attribute with the particle's target alpha.
   *
   * @param {Particle} particle - The particle containing the target alpha.
   * @return {PointsRenderer}
   */
  updatePointAlpha(particle) {
    const attribute = 'alpha';
    const { geometry } = this;
    const { stride, buffer } = geometry;
    const { target, index } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.alpha;

    return this;
  }

  /**
   * Ensures that all attribute updates are marked as needing updates from the WebGLRenderer.
   *
   * @return {PointsRenderer}
   */
  ensurePointUpdatesAreRendered() {
    Object.keys(this.geometry.attributes).map(attribute => {
      this.geometry.attributes[attribute].data.needsUpdate = true;
    });

    return this;
  }

  /**
   * Pools the particle target if it does not exist.
   * Updates the target and maps particle properties to the point.
   *
   * @param {Particle}
   */
  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = this.targetPool.get(Target);
      this.uniqueList.add(particle.id);
    }

    this.updateTarget(particle).mapParticleTargetPropsToPoint(particle);
  }

  /**
   * Maps particle properties to the point if the particle has a target.
   *
   * @param {Particle}
   */
  onParticleUpdate(particle) {
    if (!particle.target) {
      return;
    }

    this.updateTarget(particle).mapParticleTargetPropsToPoint(particle);
  }

  /**
   * Resets and clears the particle target.
   *
   * @param {Particle}
   */
  onParticleDead(particle) {
    if (!particle.target) {
      return;
    }

    particle.target.reset();
    this.mapParticleTargetPropsToPoint(particle);

    particle.target = null;
  }
};
