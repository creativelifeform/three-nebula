// The canonical VR set, keyed by scene name under sandbox/examples/ (plus any
// vr/cases/ overrides). `kind` is how the system is built:
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
  // Repaired for modern three (BufferGeometry position instead of the removed
  // Geometry `.vertices`). More frames for a fuller, settled snowfall.
  SpriteRendererSnow: { kind: 'init', frames: 260 },
  // #133 — additive, no-alpha texture over an in-scene gradient background
  // (the recommended approach). VR-local cases (vr/cases/), not sandbox examples.
  AdditiveSceneBackgroundCpu: { kind: 'init', frames: 200 },
  AdditiveSceneBackgroundGpu: { kind: 'init', frames: 200 },
};
