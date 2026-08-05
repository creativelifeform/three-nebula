import BaseRenderer from '../../renderer/BaseRenderer';
import type Particle from '../../core/Particle';
import type {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Object3D,
  Sprite,
  SpriteMaterial,
} from 'three';
import type { Mesh, SpriteNodeMaterial } from 'three/webgpu';
import { attribute, mix, texture, uv, vec2 } from 'three/tsl';

import TextureAtlas from './TextureAtlas';
import { ATLAS_INDEX_SIZE, DEFAULT_MAX_PARTICLES } from './constants';

type ThreeWebGPU = typeof import('three/webgpu');

interface RendererOptions {
  maxParticles?: number;
}

/**
 * WebGPU batched particle renderer.
 *
 * The node/TSL counterpart of the GLSL `GPURenderer`: draws every particle as a
 * camera-facing instanced quad (`SpriteNodeMaterial`) in a single call, with
 * per-instance position / colour / alpha / scale / rotation / texture supplied
 * through instanced attributes, and multiple textures packed into one atlas.
 *
 * Sizing is **world-scale** (`scale * radius` in world units, matching
 * `SpriteRenderer`), not the GLSL renderer's `gl_PointSize` point-size model.
 *
 * Requires the host to use three's `WebGPURenderer`; pass the `three/webgpu`
 * namespace as `three`.
 */
export default class GPURenderer extends BaseRenderer {
  three: ThreeWebGPU;
  container: Object3D;
  maxParticles: number;

  mesh: Mesh;
  material: SpriteNodeMaterial;
  geometry: InstancedBufferGeometry;
  atlas: TextureAtlas;

  private aOffset: InstancedBufferAttribute;
  private aColor: InstancedBufferAttribute;
  private aAlpha: InstancedBufferAttribute;
  private aScale: InstancedBufferAttribute;
  private aRotation: InstancedBufferAttribute;
  private aTexID: InstancedBufferAttribute;

  private idToIndex: Map<string, number>;
  private freeSlots: number[];
  private highWater: number;
  private dirty: boolean;

  constructor(
    container: Object3D,
    three: ThreeWebGPU,
    options: RendererOptions = {}
  ) {
    super('WebGPUGPURenderer');

    const max = options.maxParticles ?? DEFAULT_MAX_PARTICLES;

    this.three = three;
    this.container = container;
    this.maxParticles = max;

    this.idToIndex = new Map();
    this.freeSlots = [];
    for (let i = max - 1; i >= 0; i--) {
      this.freeSlots.push(i);
    }
    this.highWater = 0;
    this.dirty = false;

    const attr = (size: number): InstancedBufferAttribute =>
      new three.InstancedBufferAttribute(new Float32Array(max * size), size);

    this.aOffset = attr(3);
    this.aColor = attr(3);
    this.aAlpha = attr(1);
    this.aScale = attr(1);
    this.aRotation = attr(1);
    this.aTexID = attr(1);

    const base = new three.PlaneGeometry(1, 1);
    const geometry = new three.InstancedBufferGeometry();

    geometry.index = base.index;
    geometry.setAttribute('position', base.attributes.position);
    geometry.setAttribute('uv', base.attributes.uv);
    geometry.setAttribute('aOffset', this.aOffset);
    geometry.setAttribute('aColor', this.aColor);
    geometry.setAttribute('aAlpha', this.aAlpha);
    geometry.setAttribute('aScale', this.aScale);
    geometry.setAttribute('aRotation', this.aRotation);
    geometry.setAttribute('aTexID', this.aTexID);
    geometry.instanceCount = 0;
    this.geometry = geometry;

    this.atlas = new TextureAtlas(three);

    const material = new three.SpriteNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: three.AdditiveBlending,
    });

    material.positionNode = attribute('aOffset');
    material.scaleNode = attribute('aScale');
    material.rotationNode = attribute('aRotation');
    material.opacityNode = attribute('aAlpha');
    this.material = material;
    this.buildColorNode();

    this.mesh = new three.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    container.add(this.mesh);
  }

  /**
   * Wires the atlas texture + index into the colour node. Rebuilt whenever the
   * atlas texture is recreated (a new texture packed in).
   */
  buildColorNode(): void {
    const texID = attribute('aTexID');
    const indexUV = vec2(texID.add(0.5).div(ATLAS_INDEX_SIZE), 0.5);
    const tileRect = texture(this.atlas.atlasIndex, indexUV); // minU,minV,maxU,maxV
    const tileUV = mix(tileRect.xy, tileRect.zw, uv());

    this.material.colorNode = texture(this.atlas.atlasTexture, tileUV).mul(
      attribute('aColor')
    );
    this.material.needsUpdate = true;
  }

  private slot(particle: Particle): number {
    const existing = this.idToIndex.get(particle.id);

    if (existing !== undefined) {
      return existing;
    }

    const index = this.freeSlots.pop() as number;

    this.idToIndex.set(particle.id, index);
    this.highWater = Math.max(this.highWater, index + 1);
    this.geometry.instanceCount = this.highWater;

    return index;
  }

  private write(particle: Particle): void {
    const i = this.slot(particle);
    const { position, color } = particle;

    this.aOffset.array[i * 3 + 0] = position.x;
    this.aOffset.array[i * 3 + 1] = position.y;
    this.aOffset.array[i * 3 + 2] = position.z;
    this.aColor.array[i * 3 + 0] = color.r;
    this.aColor.array[i * 3 + 1] = color.g;
    this.aColor.array[i * 3 + 2] = color.b;
    this.aAlpha.array[i] = particle.alpha;
    this.aScale.array[i] = particle.scale * particle.radius;
    this.aRotation.array[i] = particle.rotation.z;

    const body = particle.body;

    if (body && body instanceof this.three.Sprite) {
      const map = (body as Sprite).material.map;

      if (map) {
        this.aTexID.array[i] = this.atlas.register(
          (body.material as SpriteMaterial).map!
        );
      }
    }

    this.dirty = true;
  }

  onParticleCreated(particle: Particle): void {
    this.write(particle);
  }

  onParticleUpdate(particle: Particle): void {
    this.write(particle);
  }

  onParticleDead(particle: Particle): void {
    const index = this.idToIndex.get(particle.id);

    if (index === undefined) {
      return;
    }

    this.aScale.array[index] = 0; // zero-size => invisible
    this.idToIndex.delete(particle.id);
    this.freeSlots.push(index);
    this.dirty = true;
  }

  onSystemUpdate(): void {
    if (this.atlas.update()) {
      this.buildColorNode(); // atlas texture recreated => rewire the node graph
    }

    if (!this.dirty) {
      return;
    }

    for (const a of [
      this.aOffset,
      this.aColor,
      this.aAlpha,
      this.aScale,
      this.aRotation,
      this.aTexID,
    ]) {
      a.needsUpdate = true;
    }

    this.dirty = false;
  }

  destroy(): void {
    this.container.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.atlas.destroy();
  }
}
