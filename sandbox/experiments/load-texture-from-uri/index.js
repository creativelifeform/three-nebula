import * as THREE from 'three';
import System, { SpriteRenderer } from 'three-nebula';
import { run } from '/common/run.js';
import { SYSTEM, DOT_TEXTURE_REF } from './data.js';

// Content-addressed assets (spec 05). The serialized system (./data.js) references
// its sprite texture by content hash (`textureRef`) rather than inlining base64.
// We supply a `resolveAsset` that maps a ref -> URL; fromJSONAsync then fetches
// that URL via the normal TextureLoader. In production the URL points at a CDN
// keyed by hash (immutable, dedup-friendly); here it's the sandbox-served dot.png.

// A tiny content-addressed store: hash -> URL. A real one would compose the CDN
// base with the ref (`https://cdn.example.com/${ref.hash}`); for the demo we map
// the one known hash to the asset the dev server already serves over HTTP.
const ASSET_URLS = {
  [DOT_TEXTURE_REF.hash]: '/assets/dot.png',
};

const resolveAsset = async ref => {
  const url = ASSET_URLS[ref.hash];

  if (!url) {
    throw new Error(`No URL registered for asset ${ref.hash}`);
  }

  // Visible in the console so you can see the ref -> URL indirection fire.
  console.log(`resolveAsset: ${ref.hash} (${ref.mime}) -> ${url}`);

  return url;
};

const init = async ({ scene, camera }) => {
  camera.position.set(0, 20, 440);
  camera.lookAt(0, 0, 0);

  // The whole feature in one call: the texture is loaded from the resolved URL,
  // not from bytes embedded in the JSON.
  const system = await System.fromJSONAsync(SYSTEM, THREE, { resolveAsset });

  return system.addRenderer(new SpriteRenderer(scene, THREE));
};

run(init, {
  shouldRotateCamera: false,
  shouldAddCameraControls: true,
  cameraTarget: [0, 0, 0],
});
