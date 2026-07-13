// The canonical VR set = the website's example pages (website/pages/examples),
// mapped to their components. `kind` is how the system is built:
//   init — procedural: init(THREE, { scene, camera, renderer }) → system
//   json — System.fromJSONAsync(data, THREE) + a GPURenderer
// `frames` is the fixed step count captured (tuned per example so the system is
// warmed up but representative). `broken` marks a repair item excluded from the
// golden master until modernised.
export const EXAMPLES = {
  SpriteRendererGravity: { kind: 'init', frames: 120 },
  SpriteRendererPointZone: { kind: 'init', frames: 120 },
  CustomRenderer: { kind: 'init', frames: 120 },
  EightDiagrams: { kind: 'init', frames: 120 },
  LifeCycleApi: { kind: 'init', frames: 120 },
  MeshRenderer: { kind: 'init', frames: 120 },
  MeshRendererCollision: { kind: 'init', frames: 120 },
  EmitterBehaviors: { kind: 'json', frames: 120 },
  GpuRenderer: { kind: 'json', frames: 120 },
  // Uses the removed Geometry `.vertices` API — throws on modern three.
  // A repair item (028), not a regression item; excluded from the golden master.
  SpriteRendererSnow: { kind: 'init', frames: 120, broken: true },
};
