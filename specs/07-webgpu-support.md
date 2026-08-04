# 07 — WebGPU support

**Status:** Not started (spec only). **Shape:** New capability + packaging — opt-in
and additive; does **not** break the existing WebGL path. **Relates to:**
[[render-target-additive-compositing]] (a future GPU-compute path could subsume it) and
spec 02 (determinism) — see _Level 2_ for why compute simulation is deliberately out of
scope here.

---

## Summary

three-nebula is a **passive** library: its renderers add `Object3D` bodies
(`Sprite` / `Mesh` / `Points`) to the host's scene, and the **host** owns the renderer,
the render loop, and injects the `three` namespace. So "WebGPU support" concretely means:

> **The library's renderers work when the host uses `THREE.WebGPURenderer` (from
> `three/webgpu`) instead of `THREE.WebGLRenderer`.**

There are three levels, of increasing cost and value:

- **Level 0 — compatibility.** Make the CPU-material renderers (`SpriteRenderer`,
  `MeshRenderer`, `CustomRenderer`) render correctly under `WebGPURenderer`. Small; likely
  mostly works already.
- **Level 1 — a TSL/node `WebGPURenderer`.** Reimplement the instanced batched renderer's
  shaders in **TSL** so it runs under three's `WebGPURenderer` (and, for free, on that
  renderer's WebGL2 backend), shipped as three-nebula's `WebGPURenderer` (see _Naming_). This
  is the real work.
- **Level 2 — GPU-compute simulation.** Move particle *simulation* onto the GPU via compute
  shaders. **Out of scope** for this spec (see below); flagged as a future initiative.

**Recommendation: target Level 0 + Level 1.** Leave simulation on the CPU.

---

## Background — where the library touches the GPU

Audit of the `three.*` surface used across `src/renderer/`:

| Renderer | three surface | WebGPU status |
|---|---|---|
| `SpriteRenderer` | `THREE.Sprite`, `THREE.SpriteMaterial` (per-particle material clones via a pool), `sprite.rotation` | Standard material → **auto-converted** by WebGPURenderer. Verify. |
| `MeshRenderer` | `THREE.Mesh`, `THREE.BoxGeometry`, `THREE.MeshLambertMaterial`, material/target pools | Standard material → **auto-converted**. Verify. |
| `CustomRenderer` | Whatever bodies/materials the host supplies | Works iff the host's materials are WebGPU-compatible. |
| `GPURenderer` (Desktop + Mobile) | Custom `THREE.ShaderMaterial` with **hand-written GLSL** (`gl_FragColor`, `gl_PointCoord`, `texture2D`), `THREE.Points`, interleaved attributes (`DynamicDrawUsage`), a `DataTexture` (Float) atlas-index, a `CanvasTexture` atlas | **Incompatible.** WebGPURenderer does not compile GLSL `ShaderMaterial`. |

**The entire WebGPU incompatibility is the `GPURenderer`.** Nine files under
`src/renderer/GPURenderer/**` carry GLSL shaders / `ShaderMaterial`; everything else uses
standard three objects that WebGPURenderer already understands.

Context: three **r171** (Sept 2025) made `WebGPURenderer` production-ready with a
zero-config `three/webgpu` import; the current line is r184. **TSL** (Three Shading
Language) lets a shader be written once and compiled to **both WGSL and GLSL**. The library
floor is `three >=0.122.0 <1.0.0`; the WebGPU path needs a newer floor, handled by
packaging (below) so the core is unaffected.

---

## Does WebGPU remove the need for the `GPURenderer`?

**No — but it removes the need for _this_ `GPURenderer`.** Separate two things:

- **The concept — batching.** The `GPURenderer` exists for one reason: draw N particles in
  **one** call instead of N `Object3D`s (which is what `SpriteRenderer` / `MeshRenderer` do).
  That win holds on **both** backends — WebGPU lowers per-draw-call CPU cost, but one batched
  draw still beats thousands. So a batched renderer stays worth having, especially at high
  particle counts.
- **The implementation — bespoke GLSL.** What WebGPU + modern three *do* obviate is our
  **hand-rolled machinery**: a custom GLSL `ShaderMaterial`, `gl.POINTS` point-sprites, a
  manual `DataTexture` tile-index, and the Desktop/Mobile split. Modern three ships the
  batching primitives directly (`InstancedMesh` / `SpriteNodeMaterial` / `BatchedMesh` + TSL).
  So **Level 1 is not a GLSL→TSL transliteration; it is a rebuild on standard instancing
  primitives** — far less custom code, and the entire class of point-sprite bugs we just
  fought (point-size clamping, the #293 mipmap-regeneration saga, swiftshader's blocky points)
  **simply does not exist** with instanced quads.

The concept only truly dissolves at **Level 2**: if simulation moves to GPU compute, the
simulator and renderer merge into one GPU pipeline and "a rendering-only `GPURenderer` /
`WebGPURenderer`" stops being a separate thing. That is the future initiative — not this spec.

## Naming — `WebGPURenderer`

The renderer names here are **consumer-facing signposts** — chosen for immediate clarity
about *what to reach for on your backend*, not internal accuracy. `GPURenderer` is,
strictly, a misnomer (it does no GPU *simulation* — it batches every particle into one
instanced draw), but to a consumer it reads clearly as "the fast, GPU-accelerated renderer
for lots of particles," and it **stays as-is**.

By the same principle, the WebGPU-path renderer is **`WebGPURenderer`**: a consumer on
WebGPU instantly knows this is the one for them, mirroring the three renderer they're already
using. No rename, no alias — `GPURenderer` is untouched.

```
import { GPURenderer }    from 'three-nebula';         // WebGL host
import { WebGPURenderer } from 'three-nebula/webgpu';  // WebGPU host
```

**Known trade-off (accepted):** the name shadows three's own `WebGPURenderer` (the *device*
renderer). A consumer importing both by name must alias one —
`import { WebGPURenderer as NebulaWebGPURenderer } from 'three-nebula/webgpu'` — and we
document that. Namespace imports (`import * as THREE from 'three/webgpu'`, then
`THREE.WebGPURenderer`) don't collide. The clarity win is judged worth the shadowing.

## Level 0 — CPU-material renderers under WebGPURenderer

**Effort: small.** WebGPURenderer auto-converts the standard material set to node
materials, so `SpriteRenderer` / `MeshRenderer` are *expected* to render with no code
change — the host just passes a `three/webgpu` namespace and a `WebGPURenderer`.

Work is an **audit matrix**, verified empirically on a real GPU, of the features these
renderers lean on:

- **Blending modes** (`AdditiveBlending`, `NormalBlending`, …) — do they map faithfully?
- **Texture `colorSpace`** and tone mapping under the node pipeline (cf. the colour
  lessons from the #293 investigation).
- **`sprite.rotation`**, per-particle **color / alpha / scale** via material clones.
- **Async init**: `WebGPURenderer.init()` is async. The host owns it, but any library code
  that *touches* the renderer must not assume it's ready synchronously. (Today the renderers
  essentially don't touch the renderer object — confirm.)

**Packaging: zero new dependencies.** These renderers import no node/TSL code, so Level 0
ships in the core bundle at the current three floor; only the *host's* three must be r171+.

---

## Level 1 — a TSL / node `WebGPURenderer`

Reimplement the batched renderer's shader work — atlas tile-rect lookup, point-sprite
rotation, per-particle colour/alpha, additive accumulation — in **TSL**, as a node material.
Because TSL compiles to both WGSL and GLSL, three-nebula's node `WebGPURenderer` runs under
three's `WebGPURenderer` on **both** its WebGPU and WebGL2 backends. It does **not** run
under the classic `WebGLRenderer` (which needs the GLSL `ShaderMaterial`), so **both
implementations coexist**: `GPURenderer` (GLSL) for `WebGLRenderer` hosts, `WebGPURenderer`
(node/TSL) for `WebGPURenderer` hosts.

Porting notes:

- **Point sprites → instanced quads.** WebGPU has no direct `gl.POINTS` point-sprite
  analogue, and large rotated textured points were exactly where WebGL bit us (#293,
  swiftshader). The robust cross-backend approach is **instanced quads** (a
  `SpriteNodeMaterial` / instanced geometry) rather than `PointsNodeMaterial`. Decide and
  prototype; instanced quads also sidestep point-size clamping.
- **Atlas.** The `CanvasTexture` atlas and `DataTexture` tile-index become node
  `texture()` / storage samples. **Preserve the #293 mipmap fix** (recreate the atlas
  texture at final size so mipmaps generate) — it is equally necessary here.
- **Attributes.** Interleaved per-particle buffers → instanced buffer attribute nodes.
- **Desktop vs Mobile.** Both variants exist today (the Mobile one drops the `DataTexture`
  index for a `canvas.width + 1` normalisation). The node rewrite likely **collapses the
  Desktop/Mobile split** — the backend abstraction removes the reason it existed.

### Packaging

`WebGPURenderer` imports `three/webgpu` + `three/tsl`; these must **not** leak into the WebGL
build. Expose it behind the `three-nebula/webgpu` subpath:

```
import { WebGPURenderer } from 'three-nebula/webgpu';  // node/TSL, three-WebGPURenderer hosts
import { GPURenderer }    from 'three-nebula';          // GLSL, three-WebGLRenderer hosts
```

- Core bundle stays dependency-clean and at the current three floor.
- The `webgpu` entry declares `three/webgpu` (r171+) as an **optional peer**; its `.d.ts`
  depends on the node-material types from there.

### API — two named entry points, on purpose

The two backends get **two distinct, self-documenting names** (`GPURenderer`,
`WebGPURenderer`) so a consumer picks the one matching their three renderer — clarity is the
point. We deliberately do **not** hide this behind a single auto-detecting class: that would
obscure which backend the consumer is on, the opposite of the naming goal.

---

## Level 2 — GPU-compute simulation (OUT OF SCOPE)

WebGPU's headline feature is **compute**, and moving simulation onto the GPU would unlock
particle counts the CPU pipeline can't touch. It is deliberately **not** in this spec
because it is a separate engine initiative, not a rendering change:

- three-nebula simulates on the **CPU** today — seeded and deterministic, which is the basis
  of the VR golden master and spec 02 (determinism / scrubbing). GPU float math is
  **non-deterministic** across vendors.
- Initializers and behaviours operate on CPU `Particle` objects; a compute path needs them
  expressed as GPU kernels (TSL compute / storage buffers) and a readback story for
  collision, events, and `onUpdate`.
- It entangles hard with **02 (determinism)** and **01 (hierarchy)** and would break the
  schema.

Flag as a **future spec** ("GPU compute particle simulation") depending on this one + 02.

---

## Testing

The VR golden master runs on **SwiftShader (WebGL)** for cross-machine determinism (see
`vr/README.md`). **WebGPU has no equivalent cheap, deterministic software path**: headless
Chromium needs a real GPU backend (Dawn) via `--use-gl=egl` / `xvfb`, and WebGPU output is
not bit-identical across vendors. So the WebGPU path **cannot join** the pixel-exact golden
master. Strategy:

- **Keep** the WebGL VR golden master as the deterministic guard (it already covers the
  CPU-material renderers and the GLSL `GPURenderer`, and simulation stays on CPU so it's
  unaffected).
- **Unit-test the node graph** — assert the node material/uniforms are constructed and wired
  (environment-independent, like `test/renderer/TextureAtlas.spec.js`).
- **Real-GPU headed validation** for visual correctness — eyeballed / loose tolerance
  (headed Playwright on a real GPU, as used to validate #293), **not** a committed pixel
  baseline.
- Optionally a **headed + xvfb GPU smoke job** (does it render non-blank?) rather than
  pixel-exact.

---

## Scope checklist

- [ ] **Level 0** audit matrix + fixes (Sprite / Mesh / Custom under `WebGPURenderer`).
- [ ] **Level 1** node/TSL `WebGPURenderer`: instanced-quad vs `PointsNodeMaterial` decision;
      atlas as node textures (preserving the #293 mipmap fix); additive blend; rotation;
      per-particle attributes; likely collapse Desktop/Mobile.
- [ ] **Naming**: ship as `WebGPURenderer` (mirrors the host renderer); `GPURenderer`
      untouched; document the alias-on-collision guidance.
- [ ] **Packaging**: `three-nebula/webgpu` subpath; keep node deps out of the core bundle;
      optional peer + types.
- [ ] **Testing**: node-graph unit tests + real-GPU headed validation; keep WebGL VR as the
      deterministic guard.
- [ ] **Docs**: using three-nebula with `WebGPURenderer`.

## Risks / open questions

- Does WebGPURenderer's auto-conversion faithfully reproduce the Sprite/Mesh look
  (blending, colour space, sprite rotation)? — Level 0 audit answers this empirically.
- `PointsNodeMaterial` vs instanced quads for the GPU renderer — fidelity, perf, complexity.
- **Two batched-renderer implementations to maintain** — `GPURenderer` (GLSL) and
  `WebGPURenderer` (node). Long term, three's `WebGPURenderer` WebGL2 backend could let the
  single node renderer serve everyone and retire the GLSL one — but that forces all users onto
  `three/webgpu`. Decision deferred.
- **Name shadowing** three's `WebGPURenderer` — accepted for clarity; document the
  alias-on-collision guidance in the README/examples.
- three floor: the `webgpu` entry needs r171+; the core stays `>=0.122.0`.

## References

- three r171 made `WebGPURenderer` production-ready (zero-config `three/webgpu`); TSL
  compiles once to WGSL + GLSL — <https://www.utsubo.com/blog/threejs-2026-what-changed>,
  <https://www.utsubo.com/blog/webgpu-threejs-migration-guide>
- Headless GPU/WebGPU testing constraints (real GPU via egl/xvfb; no cheap software path) —
  <https://michelkraemer.com/enable-gpu-for-slow-playwright-tests-in-headless-mode/>,
  <https://blog.promaton.com/testing-3d-applications-with-playwright-on-gpu-1e9cfc8b54a9>
- `vr/README.md` — the SwiftShader determinism rationale and GPURenderer blind spot (why
  WebGPU can't join the deterministic golden master).
- The #293 atlas mipmap fix — the node port must preserve it.
