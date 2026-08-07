import * as THREE from 'three/webgpu';

import { GPURenderer } from '../../src/webgpu';
import chai from 'chai';
import domino from 'domino';

const { assert } = chai;

// The renderer creates a canvas for its atlas; give it a DOM. domino throws on
// getContext('2d'), so stub createElement('canvas') with a minimal fake canvas
// + 2d context (only what the atlas touches).
global.window = domino.createWindow();
global.document = window.document;

const realCreateElement = document.createElement.bind(document);

document.createElement = tag => {
  if (tag !== 'canvas') {
    return realCreateElement(tag);
  }

  const canvas = { width: 0, height: 0, style: {}, remove() {} };

  canvas.getContext = () => ({ canvas, drawImage() {}, clearRect() {} });

  return canvas;
};

const build = () => {
  const scene = new THREE.Scene();

  return {
    scene,
    renderer: new GPURenderer(scene, THREE, { maxParticles: 100 }),
  };
};

// Environment-independent structural guard for the WebGPU renderer's node graph
// and buffer layout (per spec 07 — WebGPU can't join the pixel golden master,
// so we snapshot construction instead of rendering).
describe('webgpu -> GPURenderer', () => {
  it('constructs an instanced batched renderer wired for WebGPU', () => {
    const { scene, renderer } = build();

    assert.instanceOf(renderer.material, THREE.SpriteNodeMaterial);
    assert.strictEqual(renderer.material.blending, THREE.AdditiveBlending);
    assert.isTrue(renderer.material.transparent);
    assert.isFalse(renderer.material.depthWrite);

    for (const node of [
      'positionNode',
      'scaleNode',
      'rotationNode',
      'opacityNode',
      'colorNode',
    ]) {
      assert.isOk(renderer.material[node], `${node} should be wired`);
    }

    assert.include(scene.children, renderer.mesh);
    assert.isFalse(renderer.mesh.frustumCulled);
  });

  it('lays out the per-instance attributes the shader reads', () => {
    const { renderer } = build();
    const expected = {
      aOffset: 3,
      aColor: 3,
      aAlpha: 1,
      aScale: 1,
      aRotation: 1,
      aTexID: 1,
    };

    for (const [name, itemSize] of Object.entries(expected)) {
      const attribute = renderer.geometry.getAttribute(name);

      assert.isOk(attribute, `${name} attribute should exist`);
      assert.strictEqual(attribute.itemSize, itemSize, `${name} itemSize`);
      assert.instanceOf(attribute, THREE.InstancedBufferAttribute);
    }
  });

  it('sets up a texture atlas (CanvasTexture + float index) for multi-texture', () => {
    const { renderer } = build();

    assert.instanceOf(renderer.atlas.atlasTexture, THREE.CanvasTexture);
    assert.instanceOf(renderer.atlas.atlasIndex, THREE.DataTexture);
    // Mipmaps on: the #293 fix regenerates them so large tiles don't alias.
    assert.isTrue(renderer.atlas.atlasTexture.generateMipmaps);
  });
});
