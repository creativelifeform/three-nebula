import { SpriteRenderer } from 'three-nebula';
import { buildAdditiveSceneBackground } from './lib/additiveSceneBackground.js';

// #133 — additive, no-alpha texture over an in-scene gradient background,
// SpriteRenderer ("CPU").
export default (THREE, ctx) =>
  buildAdditiveSceneBackground(THREE, ctx, SpriteRenderer);
