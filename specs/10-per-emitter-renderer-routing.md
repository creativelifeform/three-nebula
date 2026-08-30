# Spec 10 — Per-Emitter Renderer Routing

**Type:** new capability, additive · opt-in
**Depends on:** spec 01 (emitter hierarchy) — specifically the `particle.emitterId`
stamp, which is the routing key.
**Status:** follow-up, not scheduled. Surfaced while building the RibbonRenderer
(spec 01, Stage 4).

---

## Problem

Renderers are attached to the **System**, and the System dispatches every particle
event (`PARTICLE_CREATED/UPDATE/DEAD`) to **every** renderer (`BaseRenderer.init`
subscribes each renderer to the shared event stream). So a renderer can't be
scoped to a subset of emitters: add a `GPURenderer` and a `MeshRenderer` to one
system and *both* try to render *every* particle — double rendering.

This blocks mixed-pipeline effects that are otherwise natural now that hierarchy
exists, e.g.:

- sparks on the GPU points pipeline (`GPURenderer`) **+** their smoke on the CPU
  `MeshRenderer` **+** their trails on the `RibbonRenderer`, all in one system.

(Note: mixed *particle bodies* — meshes and textured sprites together — already
work via a single `MeshRenderer`, which clones each particle's own `body`. This
spec is about mixing *renderers*, not bodies.)

## The hook already exists

Spec 01 stamps `particle.emitterId` (the emitter's tree-path node id; `"0"`,
`"0/children/0"`, …) on every particle, and `particle.emitterInstanceId` (the
specific live instance). The `RibbonRenderer` already groups by
`emitterInstanceId` — a working proof that per-emitter filtering is viable. This
spec generalises that into an opt-in filter any renderer can use.

## Stage 0 — Audit (do before implementing)

1. Confirm `BaseRenderer.init` is the single subscription point for all four
   particle/system events, and that every renderer routes work through those
   handlers (not elsewhere).
2. Confirm every particle carries a stable `emitterId`: top-level emitters get
   `String(index)` from `System.addEmitter._assignNodeIds`; children get their
   tree path. Verify none are left `null` in a hierarchy.
3. Confirm the GPURenderer's fixed buffer sizing still holds when it only renders
   a subset (fewer particles → fine; slot recycling already bounds it).

## Design

Two approaches; recommend **A** for v1, **B** as a later optimisation.

### A — Renderer-side filter (recommended v1)

A renderer gains an optional emitter filter; its event handlers early-return for
particles that don't match. Minimal, additive, and composes with existing
renderers.

```ts
// BaseRenderer
setEmitterFilter(filter: string[] | ((p: Particle) => boolean)): this

// in each handler (or centralised in BaseRenderer's dispatch shim):
if (this._filter && !this._accepts(particle)) return;
```

- Array form matches on `emitterId` (a node and, by convention, its instances).
- Predicate form covers everything else (by `emitterInstanceId`, by depth, etc.).
- **Default (no filter) = today's behaviour** (render everything) → non-breaking.

Cost: every renderer still *receives* every event and discards the misses. Fine
for a handful of renderers; see B if that becomes hot.

### B — System-side routing (later)

`addRenderer(renderer, { emitters })` builds an `emitterId → renderers[]` map and
the System dispatches each particle event only to matching renderers. Avoids the
discarded-event cost, but changes the dispatch model (bigger, and it interacts
with the detached-instance path in hierarchy). Defer until A proves insufficient.

## Acceptance

- A system with two emitters and two renderers, each scoped to one emitter, draws
  each emitter's particles **exactly once** (no double render).
- No filter set → identical to current behaviour (regression-tested).
- Works for child-emitter particles (filter by node `emitterId`) and for a single
  trail (filter by `emitterInstanceId`).

## Risks / notes

- **Additive / semver:** opt-in filter, default unchanged → minor.
- Keep the filter check allocation-free (it runs per particle per event).
- `RibbonRenderer` is effectively already routed (implicit grouping); once A
  lands, its grouping and the filter should share one `emitterId`/instance
  convention rather than diverge.
- This is the concrete realisation of the "B2/B3" renderer-scoping options
  discussed during the spec 01 design — the emitter-hierarchy work deliberately
  left `emitterId` in place as the hook.
