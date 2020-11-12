import { Target, UniqueList } from './stores';
import { fragmentShader, vertexShader } from './shaders';

import BaseRenderer from '../BaseRenderer';
import { DEFAULT_RENDERER_OPTIONS } from './constants';
import ParticleBuffer from './ParticleBuffer';
import { Pool } from '../../core';
import { RENDERER_TYPE_GPU } from '../types';
import TextureAtlas from './TextureAtlas';

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
export default class GPURenderer extends BaseRenderer {
  constructor(container, three, options = DEFAULT_RENDERER_OPTIONS) {
    super(RENDERER_TYPE_GPU);

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
      uniforms: {
        baseColor: { value: new THREE.Color(baseColor) },
        uTexture: { value: null },
        FFatlasIndex: { value: null },
        atlasDim: { value:new THREE.Vector2()}
      },
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
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

  onSystemUpdate(system) {
    super.onSystemUpdate(system);

    this.buffer.needsUpdate = true;

    let ta= GPURenderer.textureAtlas
    if(ta){ 
        ta.update();
        this.material.uniforms.atlasDim.value.set(ta.atlasTexture.image.width,ta.atlasTexture.image.height)
    }

  } // eslint-disable-line

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
   * @return {GPURenderer}
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
      particle.target.textureIndex = GPURenderer.getTextureID(
        this,
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
   * @return {GPURenderer}
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
   * @return {GPURenderer}
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
   * @return {GPURenderer}
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
   * @return {GPURenderer}
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
   * @return {GPURenderer}
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
   * @return {GPURenderer}
   */
  updatePointTextureIndex(particle) {
    const attribute = 'texID';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    let id=target.index * stride + offset + 0
if(false){
    buffer.array[id] = target.textureIndex;
}else{
let ti=target.textureIndex*4;

    let ta=GPURenderer.textureAtlas
let ida = ta.indexData;
let nx = ida[ti++]
let ny = ida[ti++]
let px = ida[ti++]
let py = ida[ti++]

    buffer.array[id  ]=((nx*ta.atlasTexture.image.width)|0)+px;
    buffer.array[id+1]=((ny*ta.atlasTexture.image.height)|0)+py;
}
    return this;
  }
}

GPURenderer.getTextureID = (renderer, texture, debug) => {
  if (texture.textureIndex === undefined) {
    let atlas = GPURenderer.textureAtlas;

    if (!atlas) {
      atlas = GPURenderer.textureAtlas = new TextureAtlas(renderer, debug);
    }

    atlas.addTexture(texture);
  }

  return texture.textureIndex;
};
