import type { CanvasTexture, DataTexture, Texture } from 'three';
import potpack from 'potpack';
import type { PotpackBox } from 'potpack';

import { ATLAS_INDEX_SIZE } from './constants';

type ThreeWebGPU = typeof import('three/webgpu');

// potpack types x/y as optional (it fills them in when packing), but our
// entries always carry them — seeded to 0 in `register`, then set by potpack —
// so we narrow them to required and index the packed rects without guards.
interface AtlasEntry extends PotpackBox {
  texture: Texture;
  x: number;
  y: number;
}

/**
 * Packs many particle textures into a single atlas so the WebGPU renderer can
 * draw them in one instanced call. Unlike the GLSL renderer's `TextureAtlas`
 * (which writes to `ShaderMaterial` uniforms), this exposes `atlasTexture` and
 * `atlasIndex` for the node material to sample directly.
 *
 * A particle's texture id (assigned by {@link register}) indexes `atlasIndex`,
 * a 1-row float texture of tile rects (minU, minV, maxU, maxV).
 */
export default class TextureAtlas {
  three: ThreeWebGPU;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  atlasTexture: CanvasTexture;
  atlasIndex: DataTexture;
  indexData: Float32Array;
  entries: AtlasEntry[];
  textureToId: Map<Texture, number>;
  needsRebuild: boolean;

  constructor(three: ThreeWebGPU) {
    this.three = three;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = ATLAS_INDEX_SIZE;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.atlasTexture = this.makeAtlasTexture();
    this.indexData = new Float32Array(ATLAS_INDEX_SIZE * 4);
    this.atlasIndex = new three.DataTexture(
      this.indexData,
      ATLAS_INDEX_SIZE,
      1,
      three.RGBAFormat,
      three.FloatType
    );
    this.atlasIndex.magFilter = this.atlasIndex.minFilter = three.NearestFilter;
    this.atlasIndex.needsUpdate = true;
    this.entries = [];
    this.textureToId = new Map();
    this.needsRebuild = false;
  }

  /**
   * A fresh CanvasTexture over the atlas canvas. Recreated on every rebuild so
   * its mipmaps regenerate cleanly after the canvas is resized/redrawn — the
   * fix from the GLSL renderer (#293), which the node path needs too.
   */
  makeAtlasTexture(): CanvasTexture {
    const texture = new this.three.CanvasTexture(this.canvas);
    texture.flipY = false;
    texture.colorSpace = this.three.SRGBColorSpace;
    return texture; // mipmaps on (default) => smooth minification of large tiles
  }

  /**
   * Registers a texture and returns its stable id. Idempotent per texture.
   */
  register(texture: Texture): number {
    const existing = this.textureToId.get(texture);

    if (existing !== undefined) {
      return existing;
    }

    const id = this.entries.length;

    this.textureToId.set(texture, id);
    this.entries.push({ texture, w: 0, h: 0, x: 0, y: 0 });
    this.needsRebuild = true;

    return id;
  }

  /**
   * Rebuilds the atlas if a new texture was registered and all images are
   * loaded. Returns true if `atlasTexture` was recreated (the caller must
   * rewire the node graph to the new texture).
   */
  update(): boolean {
    if (!this.needsRebuild) {
      return false;
    }

    for (const entry of this.entries) {
      const image = entry.texture.image as { width?: number } | undefined;

      if (!image || !image.width) {
        return false; // wait until every image has loaded
      }
    }

    for (const entry of this.entries) {
      const image = entry.texture.image as { width: number; height: number };

      entry.w = image.width;
      entry.h = image.height;
    }

    const stats = potpack(this.entries);

    if (this.canvas.width !== stats.w || this.canvas.height !== stats.h) {
      this.canvas.width = stats.w;
      this.canvas.height = stats.h;
    }

    this.ctx.clearRect(0, 0, stats.w, stats.h);

    for (const entry of this.entries) {
      this.ctx.drawImage(
        entry.texture.image as CanvasImageSource,
        entry.x,
        entry.y,
        entry.w,
        entry.h
      );

      const i = (this.textureToId.get(entry.texture) as number) * 4;

      this.indexData[i + 0] = entry.x / stats.w;
      this.indexData[i + 1] = entry.y / stats.h;
      this.indexData[i + 2] = (entry.x + entry.w) / stats.w;
      this.indexData[i + 3] = (entry.y + entry.h) / stats.h;
    }

    this.atlasIndex.needsUpdate = true;
    this.atlasTexture.dispose();
    this.atlasTexture = this.makeAtlasTexture();
    this.needsRebuild = false;

    return true;
  }

  destroy(): void {
    this.atlasTexture.dispose();
    this.atlasIndex.dispose();
    this.entries = [];
    this.textureToId.clear();
  }
}
