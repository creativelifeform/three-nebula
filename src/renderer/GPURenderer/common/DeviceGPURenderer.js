import { ParticleBuffer, Target, TextureAtlas, UniqueList } from '../common';

import BaseRenderer from '../../BaseRenderer';
import { DEFAULT_RENDERER_OPTIONS } from '../common/constants';
import { Pool } from '../../../core';

let THREE;

/**
 * Performant particle renderer that uses THREE.Points to propagate particle (postiion, rgba etc.,) properties to
 * vertices in a ParticleBufferGeometry.
 * Uses a dynamic texture atlas to support systems with mutliple sprites in a performant way.
 *
 * NOTE! This is an experimental renderer and is currently not covered by tests, coverage will be added when the API
 * is more stable. Currently only compatible with sprite/texture based systems. Meshes are not yet supported.
 *
 * @author thrax <manthrax@gmail.com>
 * @author rohan-deshpande <rohan@creativelifeform.com>
 */
export default class DeviceGPURenderer extends BaseRenderer {
  constructor(container, three, options = DEFAULT_RENDERER_OPTIONS) {
    super(options.rendererType);

    THREE = this.three = three;
    const props = { ...DEFAULT_RENDERER_OPTIONS, ...options };
    const {
      camera,
      maxParticles,
      baseColor,
      blending,
      depthTest,
      depthWrite,
      transparent,
      shouldDebugTextureAtlas,
    } = props;
    const particleBuffer = new ParticleBuffer(maxParticles, THREE);
    const material = new THREE.ShaderMaterial({
      uniforms: this.getUniforms(baseColor),
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      blending: THREE[blending],
      depthTest,
      depthWrite,
      transparent,
    });

    this.camera = camera;
    this.targetPool = new Pool();
    this.uniqueList = new UniqueList(maxParticles);
    this.particleBuffer = particleBuffer;
    this.buffer = particleBuffer.buffer;
    this.stride = particleBuffer.stride;
    this.geometry = particleBuffer.geometry;
    this.material = material;
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.shouldDebugTextureAtlas = shouldDebugTextureAtlas;

    container.add(this.points);
  }

  getUniforms() {}

  getVertexShader() {}

  getFragmentShader() {}

  onSystemUpdate(system) {
    super.onSystemUpdate(system);

    this.buffer.needsUpdate = true;

    this.textureAtlas && this.textureAtlas.update();
  }

  /**
   * Pools the particle target if it does not exist.
   * Updates the target and maps particle properties to the point.
   *
   * @param {Particle}
   */
  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = this.targetPool.get(Target, THREE);
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

  /**
   * Maps all mutable properties from the particle to the target.
   *
   * @param {Particle}
   * @return {DesktopGPURenderer}
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
      const { map } = body.material;

      particle.target.texture = map;
      particle.target.textureIndex = this.getTextureID(
        map,
        this.shouldDebugTextureAtlas
      );
    }

    return this;
  }

  /**
   * Entry point for mapping particle properties to buffer geometry points.
   *
   * @param {Particle} particle - The particle containing the properties to map
   * @return {DesktopGPURenderer}
   */
  mapParticleTargetPropsToPoint(particle) {
    this.updatePointPosition(particle)
      .updatePointSize(particle)
      .updatePointColor(particle)
      .updatePointAlpha(particle)
      .updatePointTextureIndex(particle);

    return this;
  }

  /**
   * Updates the point's position according to the particle's target position.
   *
   * @param {Particle} particle - The particle containing the target position.
   * @return {DesktopGPURenderer}
   */
  updatePointPosition(particle) {
    const attribute = 'position';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
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
   * @return {DesktopGPURenderer}
   */
  updatePointSize(particle) {
    const attribute = 'size';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.size;

    return this;
  }

  /**
   * Updates the point's color attribute according with the particle's target color.
   *
   * @param {Particle} particle - The particle containing the target color and alpha.
   * @return {DesktopGPURenderer}
   */
  updatePointColor(particle) {
    const attribute = 'color';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
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
   * @return {DesktopGPURenderer}
   */
  updatePointAlpha(particle) {
    const attribute = 'alpha';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.alpha;

    return this;
  }

  /**
   * Updates the point texture attribute with the particle's target texture.
   *
   * @param {Particle} particle - The particle containing the target texture.
   * @return {DesktopGPURenderer}
   */
  updatePointTextureIndex(particle) {
    const attribute = 'texID';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.textureIndex;

    return this;
  }

  getTextureID(texture, debug) {
    if (texture.textureIndex === undefined) {
      if (!this.textureAtlas) {
        this.textureAtlas = new TextureAtlas(this, debug);
      }

      this.textureAtlas.addTexture(texture);
    }

    return texture.textureIndex;
  }
}
