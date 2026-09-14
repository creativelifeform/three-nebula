# Task Spec — Velocity-stretched sprites (renderer option)

**Type:** feature — renderer capability. Follow-up.
**Status:** filed, not scheduled. A working reference implementation exists in the
`curl-particles` sandbox experiment (a local `SpriteRenderer` subclass).
**Depends on:** nothing for Phase 1. Phase 2 depends on an instanced-quad GPU
draw path (see §GPURenderer).

---

## Problem

A particle trail is a **discrete sampling of a continuous path**: the gap between
consecutive samples is `speed × interval`, so any fast-moving stream shows
**banding** (visible beads/gaps) — worst exactly where particles move fastest.
Raising density and dot size only masks it and is speed-dependent.

The cheapest *universal* fix — no extra particles, no post-processing, no geometry
— is to **stretch each sprite along its own velocity** so every sprite bridges the
gap to the one ahead of it. Consecutive streaks overlap into a continuous filament.
This is the standard "stretched billboard / motion-blur particle" used across
engines for sparks, rain, speed lines and flow-field particles.

This is a **renderer** concern (how a particle is *drawn*), not a behaviour. It
only *reads* `particle.velocity`; it does not change the simulation.

## Relationship to the RibbonRenderer (why this is not redundant)

They are visually adjacent but **architecturally opposite and complementary**:

- **RibbonRenderer** builds **one** connected triangle strip from **many ordered**
  particles (a spine) — real geometry, with width, per-vertex colour/alpha and
  **UVs** (texture the whole strip as one gradient). One ribbon per emitter
  instance. Best for a *single coherent* trail (sword slash, banner, one tail).
- **Velocity-stretched sprites** elongate **each particle independently** — no
  connection between them; the "filament" is an illusion from overlapping streaks.
  Needs no ordering or grouping. Best for *many independent* fast particles
  (sparks, rain, curl-flow — thousands of streamlines with no single spine).

Rule of thumb: **one path → ribbon; many independent particles → velocity-stretch.**
`curl-particles` is the second case (thousands of independent streamlines); a
ribbon there would need one strip per particle (the heavy hierarchy route).
Neither obsoletes the other.

## Proposed

Add an opt-in **stretch** option to the per-particle renderers.

### Phase 1 — CPU renderers (ship first; works today)

- **`SpriteRenderer` `{ stretch }` option.** Override the per-particle
  rotate/scale hooks (exactly what the `curl-particles` subclass does):
  - orient the sprite so its long axis follows the velocity direction,
  - length = `base + speed × k`, width = `base` (with a `maxLength` cap so a fast
    core doesn't spike into needles).
  - **Correctness:** project the 3D velocity into **screen space** each frame
    (per camera) for the orientation — the sandbox proof took the head-on
    `world-XY ≈ screen-XY` shortcut, which only holds near head-on.
- **`MeshRenderer` stretch (optional).** A per-particle mesh can be oriented +
  scaled along the **true 3D velocity** (not billboard-limited) — correct depth
  from any angle. Same CPU per-particle cost.

Suggested option shape: `{ stretch: number, width?: number, maxLength?: number }`
(absent = today's uniform sprite, fully backward-compatible).

### Phase 2 — GPU path (follow-on)

Velocity-stretch is **impossible on the current `GPURenderer`**: it draws
`THREE.Points` with `gl_PointSize`, i.e. screen-aligned **square** point sprites
(`gl_PointSize` is a single scalar — a point cannot become a rotated, non-uniform
rectangle; the existing `rotation` attribute only spins the texture *inside* the
square). See §GPURenderer.

Support requires moving that renderer to **instanced quads** (per-instance quad
oriented + scaled in the vertex shader) and uploading a per-particle **velocity**
attribute (not carried today — only position/size/rotation/color/alpha/texID).

- **WebGPU GPURenderer: essentially free.** Its spike already uses instanced quads
  (TSL) — instanced is its native model, so it can carry stretch by adding a
  velocity attribute + shader stretch, no migration.
- **WebGL GPURenderer: opt-in, non-breaking.** Do **not** rewrite the default
  `THREE.Points` path (that shifts sizing/AA and forces a VR re-baseline — see
  the sibling analysis in the instanced-quad note). Add instanced quads as an
  **opt-in mode or sibling renderer** (e.g. `{ mode: 'quads' }` /
  `StretchGPURenderer`); converge the default in a future major with the
  re-baseline.

## §GPURenderer — why the current path can't do it

- `src/renderer/GPURenderer/{Desktop,Mobile}/index.ts`: `new THREE.Points(...)`.
- vertex shader: `gl_PointSize = (size × attenuation) / -mvPosition.z` — one
  scalar → a square. No per-particle non-uniform scale or true rotation of the
  quad shape.
- attributes uploaded: position, size, rotation, color, alpha, texID — **no
  velocity**.

## Acceptance

- A fast stream rendered with `SpriteRenderer { stretch }` shows **no banding** at
  emission densities where the un-stretched renderer beads.
- Orientation is correct from a non-head-on camera (screen-space velocity
  projection), not just head-on.
- `stretch` absent ⇒ byte-identical to today's SpriteRenderer (VR baseline
  unchanged).
- (Phase 2) an instanced-quad path renders stretched particles on GPU; enabling it
  is opt-in and leaves the default Points path (and its VR baselines) untouched.

## Risk / notes

- **CPU vs GPU tension:** velocity-stretch is cheap on Sprite/Mesh (moderate
  counts) but needs instanced quads for the high-count GPURenderer. Phase 1 covers
  everything up to mid counts today; Phase 2 is the premium, higher-lift path.
- Pair with **[[distance-based-emission]]**: that lever makes spacing uniform
  regardless of speed and is **GPURenderer-compatible now** (it changes only *when*
  particles spawn, not how they're drawn) — the low-risk universal smoothness win,
  complementary to this.
- The ribbon route (**[[ribbon-renderer-pro]]** — spline subdivision + RMF) is the
  third smoothness lever, for the *one-coherent-path* case.
