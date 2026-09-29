# Task Spec — `Field` abstraction + flow-map baker (one field → particles *and* shaders)

**Type:** feature — architecture + optional companion. Follow-up / exploratory.
**Status:** filed, not scheduled. Proof-of-concept exists: the `vortex-shader`
sandbox experiment.
**Depends on:** nothing hard. Builds on the force/flow behaviours (`Vortex`,
`CurlNoise`, `Attraction`, …). Composes with [[velocity-stretched-sprites]] /
`ribbon-renderer-pro` conceptually but is independent.

---

## The insight

Several of three-nebula's behaviours aren't "particle logic" — they're **vector
fields** `V(p)`: `Vortex` (tangential swirl + inward pull about an axis),
`CurlNoise` (curl of a noise field), `Attraction`/`Repulsion`/`Gravity`/`Spring`.
A swirling-texture **shader** is *also* driven by a vector field. So the same field
can drive **both**:

- **Particles (Lagrangian):** sample `V(p)` at each particle, integrate over time —
  the particle follows the flow. (What behaviours do today.)
- **Shaders (Eulerian):** sample `V(p)` per-pixel on a surface and advect a texture
  along it — the texture appears to flow. (A flow-shader ring/portal.)

The **field is the shareable primitive**; particles vs texture is just the
representation. three-nebula already *contains* these fields inside its force
behaviours — they're simply not exposed as a first-class concept.

This keeps the library on-identity: it doesn't ship arbitrary art shaders — it
owns the **field math** and lets shaders consume it. That's differentiated (most
particle libs hide their force fields).

## Proof of concept

`sandbox/experiments/vortex-shader` ("Vortex Behaviour Shader Experiment"): a green
ground portal where a vortex field is (a) baked into a flow-map that a ground-mesh
shader advects a noise texture along, and (b) applied to rising motes via the
`Vortex` behaviour. Same field → the texture swirl and particle swirl agree by
construction. The field formula is currently duplicated by hand — this spec is
about removing that duplication.

## Proposed

### 1. A first-class `Field` (the shared source of truth)

Factor the field math out of the force behaviours into a small `Field` interface:
`sample(p: Vector3D, out: Vector3D): Vector3D` (a pure `p → vector`). Concrete
fields: `VortexField`, `CurlNoiseField`, `AttractionField`, … The corresponding
behaviours become thin wrappers that own a `Field` and integrate it onto
`particle.velocity` — so behaviour and field can't drift.

- Additive: existing behaviour constructors/behaviour unchanged; `Field` is
  extracted underneath.
- Only the **force/flow** behaviours qualify. `Alpha`/`Scale`/`Color`/`Rotate`
  (per-particle property anims) and `RandomDrift`/`Collision`/`CrossZone`
  (stochastic/boundary) are **not** fields — leave them alone.

### 2. A flow-map baker (optional helper)

`bakeFlowMap(field, { plane, size, ... }) → DataTexture` — sample the field over a
plane (or volume slice), encode direction into RG. Ships in an **opt-in** subpath
(e.g. `three-nebula/fields` or the `postfx`/`materials` companion), never the core
render path. A consuming shader reads the flow-map and advects its texture
(dual-phase to avoid stretching — see the experiment).

- Bake is a **snapshot** — ideal for (quasi-)static fields (a vortex). Time-varying
  fields (curl noise animated) would re-bake per frame or sample live.

### 3. (Later) live field sampling in-shader

For fields that must animate live, the field function could be authored once and
emitted to both JS and shader (TSL/WGSL) — avoids re-baking but is the
dual-implementation / divergence tax. Out of scope for v1; note it.

## Where shaders live (unchanged stance)

The library provides the **field + baker**, not the art shaders. The swirling
ring/portal *material* belongs in a sandbox recipe and, ultimately, the **editor**
(art-direction UI) — consistent with the bloom/post-fx and materials decisions:
*core owns sim + field data; optional companions own compositing/materials; the
editor owns art-direction.*

## Acceptance

- `VortexField.sample(p)` returns the same vector the `Vortex` behaviour applies
  (behaviour is a thin integrator over the field); determinism preserved.
- `bakeFlowMap(vortexField, …)` produces a flow-map that, fed to the experiment's
  ring shader, matches the particle swirl (the hand-matched formula is removed —
  the experiment consumes the real field).
- Core bundle/render path unchanged for anyone not importing the fields/baker
  subpath. Additive; no behaviour changes for existing effects.

## Risk / notes

- Scope discipline: this is a *field* abstraction, not a shader library. Resist
  shipping textures/materials in core.
- WebGPU: the baker (CPU → DataTexture) is renderer-agnostic; live in-shader
  sampling (§3) would need TSL and is deferred.
- Only ~6 behaviours are true fields; be explicit that the abstraction covers the
  force/flow subset, not all behaviours.
