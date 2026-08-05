// Level 1 multi-texture parity (spec 07): render the GpuRenderer example (5
// different textures) with the reference SpriteRenderer vs the prototype WebGPU
// batched renderer + texture atlas — both under three's WebGPURenderer.
//
//   ?renderer=sprite  (default) — reference: one THREE.Sprite per particle
//   ?renderer=webgpu            — prototype: instanced quads + atlas (one draw)
import * as THREE from 'three/webgpu';
import { attribute, texture, uv, vec2, mix } from 'three/tsl';
import ParticleSystem, { SpriteRenderer } from 'three-nebula';
import potpack from 'potpack';
import SYSTEM from '../../examples/GpuRenderer/data.js';

const mode =
  new URLSearchParams(location.search).get('renderer') === 'webgpu'
    ? 'webgpu'
    : 'sprite';

const ATLAS_INDEX_SIZE = 256;

class WebGPUGPURenderer {
  constructor(scene, three, { maxParticles = 6000 } = {}) {
    this.THREE = three;
    this.max = maxParticles;
    this.freeSlots = [];
    for (let i = maxParticles - 1; i >= 0; i--) this.freeSlots.push(i);
    this.idToIndex = new Map();
    this.highWater = 0;
    this.dirty = false;

    // per-instance attributes
    this.aOffset = new three.InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3);
    this.aColor = new three.InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3);
    this.aAlpha = new three.InstancedBufferAttribute(new Float32Array(maxParticles), 1);
    this.aScale = new three.InstancedBufferAttribute(new Float32Array(maxParticles), 1);
    this.aRotation = new three.InstancedBufferAttribute(new Float32Array(maxParticles), 1);
    this.aTexID = new three.InstancedBufferAttribute(new Float32Array(maxParticles), 1);

    const base = new three.PlaneGeometry(1, 1);
    const geo = new three.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    geo.setAttribute('aOffset', this.aOffset);
    geo.setAttribute('aColor', this.aColor);
    geo.setAttribute('aAlpha', this.aAlpha);
    geo.setAttribute('aScale', this.aScale);
    geo.setAttribute('aRotation', this.aRotation);
    geo.setAttribute('aTexID', this.aTexID);
    geo.instanceCount = 0;
    this.geometry = geo;

    // --- texture atlas (packs many textures into one) ---
    this.atlasCanvas = document.createElement('canvas');
    this.atlasCanvas.width = this.atlasCanvas.height = ATLAS_INDEX_SIZE;
    this.atlasCtx = this.atlasCanvas.getContext('2d');
    this.atlasTexture = this.makeAtlasTexture();
    this.atlasEntries = [];
    this.textureToId = new Map();
    this.atlasIndexData = new Float32Array(ATLAS_INDEX_SIZE * 4);
    this.atlasIndex = new three.DataTexture(
      this.atlasIndexData, ATLAS_INDEX_SIZE, 1, three.RGBAFormat, three.FloatType
    );
    this.atlasIndex.magFilter = this.atlasIndex.minFilter = three.NearestFilter;
    this.atlasIndex.needsUpdate = true;
    this.atlasDirty = false;

    const mat = new three.SpriteNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: three.AdditiveBlending,
    });
    mat.positionNode = attribute('aOffset');
    mat.scaleNode = attribute('aScale');
    mat.rotationNode = attribute('aRotation');
    mat.opacityNode = attribute('aAlpha');
    this.material = mat;
    this.buildColorNode();

    this.mesh = new three.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  makeAtlasTexture() {
    const t = new this.THREE.CanvasTexture(this.atlasCanvas);
    t.flipY = false;
    t.colorSpace = this.THREE.SRGBColorSpace;
    return t; // mipmaps on (default) → smooth minification of large tiles
  }

  // Look up this instance's tile rect from the atlas index by texID, map the
  // quad uv into that tile, sample the atlas, tint by per-instance colour.
  buildColorNode() {
    const texID = attribute('aTexID');
    const idxUV = vec2(texID.add(0.5).div(ATLAS_INDEX_SIZE), 0.5);
    const tileRect = texture(this.atlasIndex, idxUV); // vec4: minx,miny,maxx,maxy
    const tileUV = mix(tileRect.xy, tileRect.zw, uv());
    this.material.colorNode = texture(this.atlasTexture, tileUV).mul(attribute('aColor'));
    this.material.needsUpdate = true;
  }

  init(system) {
    const self = this;
    const on = (e, fn) => system.eventDispatcher.addEventListener(e, fn);
    on('SYSTEM_UPDATE', () => self.onSystemUpdate());
    on('PARTICLE_CREATED', p => self.onParticleCreated(p));
    on('PARTICLE_UPDATE', p => self.onParticleUpdate(p));
    on('PARTICLE_DEAD', p => self.onParticleDead(p));
  }

  slot(p) {
    let i = this.idToIndex.get(p.id);
    if (i === undefined) {
      i = this.freeSlots.pop();
      this.idToIndex.set(p.id, i);
      this.highWater = Math.max(this.highWater, i + 1);
      this.geometry.instanceCount = this.highWater;
    }
    return i;
  }

  registerTexture(map) {
    if (!map) return 0;
    if (this.textureToId.has(map)) return this.textureToId.get(map);
    const id = this.atlasEntries.length;
    this.textureToId.set(map, id);
    this.atlasEntries.push({ texture: map });
    this.atlasDirty = true;
    return id;
  }

  rebuildAtlas() {
    for (const e of this.atlasEntries) {
      const img = e.texture.image;
      if (!img || !img.width) return; // wait until all images are ready
    }
    for (const e of this.atlasEntries) {
      e.w = e.texture.image.width;
      e.h = e.texture.image.height;
    }
    const stats = potpack(this.atlasEntries);
    if (this.atlasCanvas.width !== stats.w || this.atlasCanvas.height !== stats.h) {
      this.atlasCanvas.width = stats.w;
      this.atlasCanvas.height = stats.h;
    }
    this.atlasCtx.clearRect(0, 0, stats.w, stats.h);
    for (const e of this.atlasEntries) {
      this.atlasCtx.drawImage(e.texture.image, e.x, e.y, e.w, e.h);
      const id = this.textureToId.get(e.texture) * 4;
      this.atlasIndexData[id + 0] = e.x / stats.w;
      this.atlasIndexData[id + 1] = e.y / stats.h;
      this.atlasIndexData[id + 2] = (e.x + e.w) / stats.w;
      this.atlasIndexData[id + 3] = (e.y + e.h) / stats.h;
    }
    this.atlasIndex.needsUpdate = true;
    // Recreate the atlas texture so its mipmaps regenerate cleanly after the
    // canvas was resized/redrawn (the #293 fix, ported to the node material).
    this.atlasTexture.dispose();
    this.atlasTexture = this.makeAtlasTexture();
    this.buildColorNode();
    this.atlasDirty = false;
  }

  write(p) {
    const i = this.slot(p);
    this.aOffset.array[i * 3 + 0] = p.position.x;
    this.aOffset.array[i * 3 + 1] = p.position.y;
    this.aOffset.array[i * 3 + 2] = p.position.z;
    this.aColor.array[i * 3 + 0] = p.color.r;
    this.aColor.array[i * 3 + 1] = p.color.g;
    this.aColor.array[i * 3 + 2] = p.color.b;
    this.aAlpha.array[i] = p.alpha;
    this.aScale.array[i] = p.scale * p.radius;
    this.aRotation.array[i] = p.rotation.z;
    if (p.body instanceof this.THREE.Sprite) {
      this.aTexID.array[i] = this.registerTexture(p.body.material.map);
    }
    this.dirty = true;
  }

  onParticleCreated(p) { this.write(p); }
  onParticleUpdate(p) { this.write(p); }
  onParticleDead(p) {
    const i = this.idToIndex.get(p.id);
    if (i === undefined) return;
    this.aScale.array[i] = 0;
    this.idToIndex.delete(p.id);
    this.freeSlots.push(i);
    this.dirty = true;
  }

  onSystemUpdate() {
    if (this.atlasDirty) this.rebuildAtlas();
    if (!this.dirty) return;
    for (const a of [this.aOffset, this.aColor, this.aAlpha, this.aScale, this.aRotation, this.aTexID])
      a.needsUpdate = true;
    this.dirty = false;
  }
}

async function main() {
  const canvas = document.getElementById('canvas');
  const { clientWidth: w, clientHeight: h } = canvas;
  const renderer = new THREE.WebGPURenderer({ canvas, alpha: false, antialias: true });
  await renderer.init();
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, w / h, 1, 10000);
  camera.position.z = 50;

  const system = await ParticleSystem.fromJSONAsync(
    SYSTEM.particleSystemState ?? SYSTEM,
    THREE,
    { shouldAutoEmit: true }
  );
  system.addRenderer(
    mode === 'webgpu' ? new WebGPUGPURenderer(scene, THREE) : new SpriteRenderer(scene, THREE)
  );

  window.__parity = { mode, particles: () => system.emitters.reduce((n, e) => n + e.particles.length, 0) };

  async function animate() {
    system.update();
    await renderer.renderAsync(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

main().catch(e => {
  window.__parityError = String((e && e.stack) || e);
  console.error(e);
});
