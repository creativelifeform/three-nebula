import {
  RENDERER_TYPE_GPU_DESKTOP,
  RENDERER_TYPE_GPU_MOBILE,
} from '../../../types';

import { DATA_TEXTURE_SIZE } from './constants';
import { __DEV__ } from '../../../../constants';
import potpack from 'potpack';
import type { PotpackBox } from 'potpack';
import type {
  CanvasTexture,
  DataTexture,
  ShaderMaterial,
  Texture,
} from 'three';

type IndexedTexture = Texture & { textureIndex?: number };

interface AtlasEntry {
  texture: IndexedTexture;
  w?: number;
  h?: number;
  x?: number;
  y?: number;
}

interface AtlasRenderer {
  three: typeof import('three');
  type: string;
  material: ShaderMaterial;
}

/**
 * Dynamic texture atlas for performant support of systems with multiple emitters and textures.
 *
 */
export default class TextureAtlas {
  ctx: CanvasRenderingContext2D;
  shouldDebug: boolean;
  rendererType: string;
  indexData: Float32Array;
  canvas: HTMLCanvasElement;
  entries: AtlasEntry[];
  atlasIndex?: DataTexture;
  atlasTexture: CanvasTexture;
  needsUpdate?: boolean;

  constructor(renderer: AtlasRenderer, shouldDebug: boolean) {
    const { three: THREE, type: rendererType } = renderer;
    const data = new Float32Array(DATA_TEXTURE_SIZE * 4);
    const ctx = (this.ctx = document
      .createElement('canvas')
      .getContext('2d') as CanvasRenderingContext2D);
    const { canvas } = ctx;

    this.shouldDebug = shouldDebug;
    this.rendererType = rendererType;
    this.indexData = data;
    this.canvas = canvas;
    this.entries = [];

    if (rendererType === RENDERER_TYPE_GPU_DESKTOP) {
      this.atlasIndex = new THREE.DataTexture(
        data,
        DATA_TEXTURE_SIZE,
        1,
        THREE.RGBAFormat,
        THREE.FloatType
      );
    }

    canvas.width = canvas.height = DATA_TEXTURE_SIZE;

    if (shouldDebug) {
      this.debug(canvas, ctx);
    }

    this.atlasTexture = new THREE.CanvasTexture(canvas);
    this.atlasTexture.flipY = false;

    renderer.material.uniforms.uTexture.value = this.atlasTexture;

    if (rendererType === RENDERER_TYPE_GPU_DESKTOP) {
      renderer.material.uniforms.atlasIndex.value = this.atlasIndex;
    }

    renderer.material.uniformsNeedUpdate = true;
  }

  /**
   * Logs to the console when in dev mode.
   *
   */
  log(...args: unknown[]): void {
    if (!__DEV__()) {
      return;
    }

    console.log(...args);
  }

  /**
   * Debugs the texture atlas by rendering it to a canvas in the DOM.
   *
   */
  debug(_canvas?: HTMLCanvasElement, _ctx?: CanvasRenderingContext2D): void {
    const { canvas, ctx } = this;
    const halfmax = canvas.width;

    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, halfmax, halfmax);
    ctx.fillStyle = 'green';
    ctx.fillRect(0, halfmax, halfmax, halfmax);
    ctx.fillStyle = 'blue';
    ctx.fillRect(halfmax, 0, halfmax, halfmax);
    ctx.fillStyle = 'orange';
    ctx.fillRect(halfmax, halfmax, halfmax, halfmax);
    ctx.fillStyle = 'yellow';
    ctx.font = canvas.width + 'px Verdana';
    ctx.fillText('top row', 100, 500);
    ctx.fillStyle = 'pink';
    ctx.fillText('bottom row', 100, 1500);

    canvas.style.position = 'absolute';
    canvas.style.width = canvas.style.height = '300px';
    canvas.style.left = canvas.style.top = '0px';
    canvas.style.zIndex = '100';

    document.body.appendChild(canvas);
  }

  /**
   * Adds a texture to the texture atlas and flags that the atlas needs to be updated.
   *
   */
  addTexture(texture: IndexedTexture): void {
    this.log('Adding texture to atlas:', texture.uuid);

    texture.textureIndex = this.entries.length;
    this.entries.push({ texture: texture });
    this.needsUpdate = true;
  }

  /**
   * Updates the texture atlas. Will only rebuild the atlas if all images are loaded.
   *
   */
  update(): void {
    if (!this.needsUpdate) {
      return;
    }

    const {
      entries,
      canvas,
      indexData,
      ctx,
      atlasIndex,
      atlasTexture,
      rendererType,
    } = this;

    for (let i = 0; i < entries.length; i++) {
      if (!entries[i].texture.image) {
        return;
      }
    }

    this.needsUpdate = false;

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const { texture } = e;
      const { width, height } = texture.image as {
        width: number;
        height: number;
      };

      e.w = width;
      e.h = height;
    }

    const stats = potpack(entries as PotpackBox[]);

    this.log('Rebuilt atlas:', stats);

    if (canvas.width != stats.w || canvas.height != stats.h) {
      canvas.width = stats.w;
      canvas.height = stats.h;
    }

    for (let i = 0; i < entries.length; i++) {
      const e = this.entries[i];
      // textureIndex is assigned in addTexture; x/y are populated by potpack
      // above and w/h in the preceding loop, so all are defined here.
      const ii = e.texture.textureIndex! * 4;
      const ex = e.x!;
      const ey = e.y!;
      const ew = e.w!;
      const eh = e.h!;

      if (rendererType === RENDERER_TYPE_GPU_DESKTOP) {
        indexData[ii + 0] = ex / canvas.width;
        indexData[ii + 1] = ey / canvas.height;
        indexData[ii + 2] = (ex + ew) / canvas.width;
        indexData[ii + 3] = (ey + eh) / canvas.height;
      }

      if (rendererType === RENDERER_TYPE_GPU_MOBILE) {
        indexData[ii + 0] = ex / (canvas.width + 1);
        indexData[ii + 1] = ey / (canvas.height + 1);
        indexData[ii + 2] = (ex + ew) / (canvas.width + 1);
        indexData[ii + 3] = (ey + eh) / (canvas.height + 1);
      }

      ctx.drawImage(e.texture.image as CanvasImageSource, ex, ey, ew, eh);
    }

    if (rendererType === RENDERER_TYPE_GPU_DESKTOP) {
      // atlasIndex is constructed exactly when rendererType is GPU_DESKTOP.
      atlasIndex!.needsUpdate = true;
    }

    atlasTexture.needsUpdate = true;
  }

  /**
   * Disposes of the textures used by the texture atlas.
   *
   * @return void
   */
  destroy(): void {
    const { atlasIndex, atlasTexture, canvas } = this;

    atlasTexture.dispose();
    atlasIndex && atlasIndex.dispose();

    if (this.shouldDebug) {
      canvas.remove();
    }

    this.entries = [];
  }
}
