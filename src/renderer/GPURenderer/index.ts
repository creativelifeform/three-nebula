import BaseRenderer from '../BaseRenderer';
import { DEFAULT_RENDERER_OPTIONS } from './common/constants';
import DesktopGPURenderer from './Desktop';
import MobileGPURenderer from './Mobile';
import { RENDERER_TYPE_GPU } from '../types';
import type { Camera, Object3D } from 'three';

interface RendererOptions {
  camera?: Camera;
  maxParticles: number;
  baseColor: number;
  blending: string;
  depthTest: boolean;
  depthWrite: boolean;
  transparent: boolean;
  shouldDebugTextureAtlas: boolean;
  shouldForceDesktopRenderer: boolean;
  shouldForceMobileRenderer: boolean;
}

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
  constructor(
    container: Object3D,
    THREE: typeof import('three'),
    options: RendererOptions = DEFAULT_RENDERER_OPTIONS
  ) {
    super(RENDERER_TYPE_GPU);

    const { shouldForceDesktopRenderer, shouldForceMobileRenderer } = options;
    const args: [Object3D, typeof import('three'), RendererOptions] = [
      container,
      THREE,
      options,
    ];

    if (shouldForceDesktopRenderer) {
      return new DesktopGPURenderer(...args) as unknown as GPURenderer;
    }

    if (shouldForceMobileRenderer) {
      return new MobileGPURenderer(...args) as unknown as GPURenderer;
    }

    if (!this.isFloatingPointTextureSupported()) {
      return new MobileGPURenderer(...args) as unknown as GPURenderer;
    }

    return new DesktopGPURenderer(...args) as unknown as GPURenderer;
  }

  isFloatingPointTextureSupported(): boolean {
    const canvas = document.createElement('canvas');

    if (window.WebGL2RenderingContext && canvas.getContext('webgl2')) {
      // return false here to test the mobile renderer on desktop
      return true;
    }

    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    const support = !!gl.getExtension('OES_texture_float');

    canvas.remove();

    return support;
  }
}
