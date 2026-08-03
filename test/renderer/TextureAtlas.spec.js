import * as THREE from 'three';

import TextureAtlas from '../../src/renderer/GPURenderer/common/TextureAtlas';
import { RENDERER_TYPE_GPU_DESKTOP } from '../../src/renderer/types';
import chai from 'chai';
import domino from 'domino';

const { assert } = chai;

global.window = domino.createWindow();
global.document = window.document;

// domino has no canvas 2d context, so stub createElement('canvas') with a
// minimal fake canvas + 2d context — only what TextureAtlas actually touches
// (a settable width/height and a no-op drawImage).
const realCreateElement = document.createElement.bind(document);

document.createElement = tag => {
  if (tag !== 'canvas') {
    return realCreateElement(tag);
  }

  const canvas = { width: 0, height: 0, style: {}, remove() {} };

  canvas.getContext = () => ({ canvas, drawImage() {} });

  return canvas;
};

const makeRenderer = () => ({
  three: THREE,
  type: RENDERER_TYPE_GPU_DESKTOP,
  material: {
    uniforms: { uTexture: { value: null }, atlasIndex: { value: null } },
    uniformsNeedUpdate: false,
  },
});

const fakeTexture = (size, uuid) => ({
  image: { width: size, height: size },
  uuid,
});

describe('renderer -> GPURenderer -> TextureAtlas', () => {
  // Guards the multi-texture aliasing regression: the atlas texture is first
  // uploaded tiny in the constructor, then the canvas is resized/redrawn as
  // textures load. Re-uploading the resized canvas in place does not regenerate
  // GPU mipmaps under modern three/WebGL2, so trilinear minFilter aliased large
  // tiles into blocky squares. The build recreates the texture at final size so
  // its first upload mipmaps cleanly — this test locks that behaviour in.
  it('recreates the atlas texture with mipmaps enabled after a build', () => {
    const renderer = makeRenderer();
    const atlas = new TextureAtlas(renderer, false);
    const initialTexture = atlas.atlasTexture;

    // A large + a small tile — the mix that only stays smooth if the atlas
    // texture regenerates its mipmaps after the canvas is resized.
    atlas.addTexture(fakeTexture(512, 'big'));
    atlas.addTexture(fakeTexture(32, 'small'));
    atlas.update();

    const { value } = renderer.material.uniforms.uTexture;

    // Recreated (not the tiny constructor texture) and wired to the material.
    assert.instanceOf(value, THREE.CanvasTexture);
    assert.notStrictEqual(
      value,
      initialTexture,
      'atlas texture should be recreated after the build'
    );
    assert.strictEqual(value, atlas.atlasTexture);

    // Mipmapped, so trilinear minification stays smooth instead of aliasing
    // large tiles into blocky squares.
    assert.isTrue(
      value.generateMipmaps,
      'atlas texture must keep mipmaps enabled'
    );
    assert.strictEqual(value.minFilter, THREE.LinearMipmapLinearFilter);
  });
});
