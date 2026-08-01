import BaseRenderer from '../BaseRenderer';
import DesktopGPURenderer from './Desktop';
import MobileGPURenderer from './Mobile';
import { RENDERER_TYPE_GPU } from '../types';
import type { Camera, Object3D } from 'three';

type BlendingMode =
  | 'AdditiveBlending'
  | 'NormalBlending'
  | 'SubtractiveBlending'
  | 'MultiplyBlending'
  | 'NoBlending'
  | 'CustomBlending';

interface RendererOptions {
  camera?: Camera;
  maxParticles: number;
  baseColor: number;
  blending: BlendingMode;
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
class GPURendererImpl extends BaseRenderer {
  constructor(
    container: Object3D,
    THREE: typeof import('three'),
    options: Partial<RendererOptions> = {}
  ) {
    super(RENDERER_TYPE_GPU);

    const { shouldForceDesktopRenderer, shouldForceMobileRenderer } = options;
    const args: [Object3D, typeof import('three'), Partial<RendererOptions>] = [
      container,
      THREE,
      options,
    ];

    if (shouldForceDesktopRenderer) {
      return new DesktopGPURenderer(...args);
    }

    if (shouldForceMobileRenderer) {
      return new MobileGPURenderer(...args);
    }

    if (!isFloatingPointTextureSupported()) {
      return new MobileGPURenderer(...args);
    }

    return new DesktopGPURenderer(...args);
  }
}

/**
 * Feature-detects renderable floating-point texture support (used to choose the
 * desktop vs mobile renderer). Module-scoped rather than an instance method:
 * `new GPURenderer(...)` returns a concrete Desktop/Mobile instance, so the
 * facade must not advertise a method those instances don't carry.
 */
const isFloatingPointTextureSupported = (): boolean => {
  const canvas = document.createElement('canvas');

  if (window.WebGL2RenderingContext && canvas.getContext('webgl2')) {
    // return false here to test the mobile renderer on desktop
    return true;
  }

  const gl = canvas.getContext('webgl') as WebGLRenderingContext;
  const support = !!gl.getExtension('OES_texture_float');

  canvas.remove();

  return support;
};

/**
 * `new GPURenderer(...)` constructs and returns a concrete `DesktopGPURenderer`
 * or `MobileGPURenderer` (a constructor-return override), never a bare facade.
 * The public type is that real union, so the shipped declarations describe the
 * object consumers actually receive — including its `points`, `textureAtlas`,
 * etc. — instead of an empty facade class that claimed a method the instances
 * don't have.
 */
type GPURenderer = DesktopGPURenderer | MobileGPURenderer;

const GPURenderer = GPURendererImpl as unknown as {
  new (
    container: Object3D,
    THREE: typeof import('three'),
    options?: Partial<RendererOptions>
  ): GPURenderer;
};

export default GPURenderer;
