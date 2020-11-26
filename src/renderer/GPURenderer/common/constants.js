import { DEFAULT_MAX_PARTICLES } from './ParticleBuffer/constants';

export const DEFAULT_RENDERER_OPTIONS = {
  blending: 'AdditiveBlending',
  baseColor: 0xffffff,
  depthTest: true,
  depthWrite: false,
  transparent: true,
  maxParticles: DEFAULT_MAX_PARTICLES,
  shouldDebugTextureAtlas: false,
  shouldForceDesktopRenderer: false,
  shouldForceMobileRenderer: false,
};
