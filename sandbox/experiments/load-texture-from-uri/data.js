// A serialized system whose sprite texture is NOT inlined as base64. Instead the
// Texture initializer carries a content-addressed `textureRef: { hash, mime }`
// (spec 05). At load time `fromJSONAsync` hands that ref to the consumer-supplied
// `resolveAsset` (see index.js), which turns it into a URL the loader fetches —
// so the bytes live at a URL/CDN, not in the JSON.
//
// The hash is the asset's identity: a sha256 over the raw PNG bytes, produced by
// the editor at save time. The runtime never derives or trusts it — it just
// passes the whole ref to resolveAsset. Here it's a fixed placeholder standing in
// for that real content hash.
export const DOT_TEXTURE_REF = {
  hash: 'sha256:0c0ffee5oft91owdemodotpng0000000000000000000000000000000000',
  mime: 'image/png',
};

export const SYSTEM = {
  preParticles: 3000,
  integrationType: 'EULER',
  emitters: [
    {
      rate: {
        particlesMin: 18,
        particlesMax: 26,
        perSecondMin: 0.01,
        perSecondMax: 0.02,
      },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      initializers: [
        { type: 'Mass', properties: { min: 1, max: 1 } },
        { type: 'Life', properties: { min: 2.4, max: 3.6 } },
        // The star of the demo: no inline base64 `texture`, only `textureRef`.
        // fromJSONAsync resolves the ref -> URL -> loads it, then builds the same
        // Texture initializer it would for an inline texture.
        {
          type: 'Texture',
          properties: {
            textureRef: DOT_TEXTURE_REF,
            materialProperties: { blending: 'AdditiveBlending' },
          },
        },
        { type: 'Radius', properties: { width: 16, height: 10 } },
        // radius = launch speed, axis = +Y, theta = max cone half-angle (deg)
        // off that axis. 180 -> a full spherical spread: an expanding glow sphere,
        // centred, showing the loaded texture in every direction.
        {
          type: 'RadialVelocity',
          properties: { radius: 110, x: 0, y: 1, z: 0, theta: 180 },
        },
      ],
      behaviours: [
        { type: 'Alpha', properties: { alphaA: 1, alphaB: 0 } },
        { type: 'Color', properties: { colorA: '#4fd0ff', colorB: '#ff3df2' } },
        { type: 'Scale', properties: { scaleA: 1, scaleB: 0.3 } },
      ],
    },
  ],
};
