import { ParticleBuffer, Target, TextureAtlas, UniqueList } from '../common';
import { fragmentShader, vertexShader } from './shaders';

import BaseRenderer from '../../BaseRenderer';
import { DEFAULT_RENDERER_OPTIONS } from '../common/constants';
import { Pool } from '../../../core';
import { RENDERER_TYPE_GPU_DESKTOP } from '../../types';
import type Particle from '../../../core/Particle';
import type System from '../../../core/System';
import type {
  Blending,
  BufferGeometry,
  Camera,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  Object3D,
  Points,
  ShaderMaterial,
  Texture,
} from 'three';

type IndexedTexture = Texture & { textureIndex?: number };

interface RendererOptions {
  camera?: Camera;
  maxParticles: number;
  baseColor: number;
  blending: string;
  depthTest: boolean;
  depthWrite: boolean;
  transparent: boolean;
  shouldDebugTextureAtlas: boolean;
  shouldForceDesktopRenderer?: boolean;
  shouldForceMobileRenderer?: boolean;
}

let THREE: typeof import('three');

/**
 * GPURenderer for devices that support floating point textures.
 *
 * @author thrax <manthrax@gmail.com>
 * @author rohan-deshpande <rohan@creativelifeform.com>
 */
export default class DesktopGPURenderer extends BaseRenderer {
  three: typeof import('three');
  container: Object3D;
  camera: Camera;
  targetPool: Pool;
  uniqueList: UniqueList;
  particleBuffer: ParticleBuffer;
  buffer: InterleavedBuffer;
  stride: number;
  geometry: BufferGeometry;
  material: ShaderMaterial;
  points: Points;
  shouldDebugTextureAtlas: boolean;
  textureAtlas?: TextureAtlas;

  constructor(
    container: Object3D,
    three: typeof import('three'),
    options: RendererOptions = DEFAULT_RENDERER_OPTIONS
  ) {
    super(RENDERER_TYPE_GPU_DESKTOP);

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
        atlasIndex: { value: null },
      },
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      blending: (THREE as unknown as Record<string, Blending>)[blending],
      depthTest,
      depthWrite,
      transparent,
    });

    this.container = container;
    this.camera = camera!;
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

    this.container.add(this.points);
  }

  onSystemUpdate(system: System): void {
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
  onParticleCreated(particle: Particle): void {
    if (!particle.target) {
      particle.target = this.targetPool.get(Target, THREE) as Target;
      this.uniqueList.add(particle.id);
    }

    this.updateTarget(particle).mapParticleTargetPropsToPoint(particle);
  }

  /**
   * Maps particle properties to the point if the particle has a target.
   *
   * @param {Particle}
   */
  onParticleUpdate(particle: Particle): void {
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
  onParticleDead(particle: Particle): void {
    if (!particle.target) {
      return;
    }

    (particle.target as Target).reset();
    this.mapParticleTargetPropsToPoint(particle);

    particle.target = null;
  }

  /**
   * Maps all mutable properties from the particle to the target.
   *
   * @param {Particle}
   * @return {DesktopGPURenderer}
   */
  updateTarget(particle: Particle): DesktopGPURenderer {
    const { position, rotation, scale, radius, color, alpha, body, id } =
      particle;
    const { r, g, b } = color;
    const target = particle.target as Target;

    target.position.copy(position);
    target.rotation.copy(rotation);
    target.size = scale * radius;
    target.color.setRGB(r, g, b);
    target.alpha = alpha;
    target.index = this.uniqueList.find(id);

    if (body && body instanceof THREE.Sprite) {
      const { map } = body.material;

      target.texture = map;
      target.textureIndex = this.getTextureID(
        map as IndexedTexture,
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
  mapParticleTargetPropsToPoint(particle: Particle): DesktopGPURenderer {
    this.updatePointPosition(particle)
      .updatePointSize(particle)
      .updatePointRotation(particle)
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
  updatePointPosition(particle: Particle): DesktopGPURenderer {
    const attribute = 'position';
    const { geometry, stride, buffer } = this;
    const target = particle.target as Target;
    const { offset } = geometry.attributes[
      attribute
    ] as InterleavedBufferAttribute;

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
  updatePointSize(particle: Particle): DesktopGPURenderer {
    const attribute = 'size';
    const { geometry, stride, buffer } = this;
    const target = particle.target as Target;
    const { offset } = geometry.attributes[
      attribute
    ] as InterleavedBufferAttribute;

    buffer.array[target.index * stride + offset + 0] = target.size;

    return this;
  }

  /**
   * Updates the point's rotation.
   *
   * @param {Particle} particle - The particle containing the target rotation.
   * @return {DesktopGPURenderer}
   */
  updatePointRotation(particle: Particle): DesktopGPURenderer {
    const attribute = 'rotation';
    const { geometry, stride, buffer } = this;
    const target = particle.target as Target;
    const { offset } = geometry.attributes[
      attribute
    ] as InterleavedBufferAttribute;

    buffer.array[target.index * stride + offset + 0] = target.rotation.z;

    return this;
  }

  /**
   * Updates the point's color attribute according with the particle's target color.
   *
   * @param {Particle} particle - The particle containing the target color and alpha.
   * @return {DesktopGPURenderer}
   */
  updatePointColor(particle: Particle): DesktopGPURenderer {
    const attribute = 'color';
    const { geometry, stride, buffer } = this;
    const target = particle.target as Target;
    const { offset } = geometry.attributes[
      attribute
    ] as InterleavedBufferAttribute;

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
  updatePointAlpha(particle: Particle): DesktopGPURenderer {
    const attribute = 'alpha';
    const { geometry, stride, buffer } = this;
    const target = particle.target as Target;
    const { offset } = geometry.attributes[
      attribute
    ] as InterleavedBufferAttribute;

    buffer.array[target.index * stride + offset + 0] = target.alpha;

    return this;
  }

  /**
   * Updates the point texture attribute with the particle's target texture.
   *
   * @param {Particle} particle - The particle containing the target texture.
   * @return {DesktopGPURenderer}
   */
  updatePointTextureIndex(particle: Particle): DesktopGPURenderer {
    const attribute = 'texID';
    const { geometry, stride, buffer } = this;
    const target = particle.target as Target;
    const { offset } = geometry.attributes[
      attribute
    ] as InterleavedBufferAttribute;

    buffer.array[target.index * stride + offset + 0] = target.textureIndex!;

    return this;
  }

  getTextureID(texture: IndexedTexture, debug: boolean): number {
    if (texture.textureIndex === undefined) {
      if (!this.textureAtlas) {
        this.textureAtlas = new TextureAtlas(this, debug);
      }

      this.textureAtlas.addTexture(texture);
    }

    // addTexture assigns textureIndex, so it is defined here.
    return texture.textureIndex!;
  }

  /**
   * Tears down the GPURenderer.
   *
   * @return void
   */
  destroy(): void {
    const { container, points, textureAtlas, uniqueList } = this;

    container.remove(points);
    uniqueList.destroy();
    textureAtlas && textureAtlas.destroy();
  }
}
