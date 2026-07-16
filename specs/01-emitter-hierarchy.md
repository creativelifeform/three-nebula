# Spec 01 — Emitter Hierarchy

Nested child emitters, ribbon/trail renderers, and the pooling required to make
both survivable.

**Depends on:** 04 (schema versioning) — this spec breaks the schema.
**Entangled with:** 02 (determinism) — child seeds derive from parent particle IDs.

---

## Problem

Today three-nebula emitters are siblings: a flat list, all anchored to the system
transform, running in parallel with no knowledge of each other. This is fine for
effects that happen *at one place* — fire, rain, explosions.

It cannot express effects that ride individual particles. *Every spark leaves its
own smoke trail* is unrepresentable: a sibling smoke emitter has exactly one
position and the sparks have twenty.

Parent-child emitters change the cardinality. The child is instanced **once per
parent particle**. 20 sparks → 20 live child emitter instances, each riding one
spark, each dying with it.

Ribbons and trails are grouped in here because they are the payoff: a child
emitter with `onCreate` inheritance leaving a ribbon along a parent's path is the
sword-arc effect, and it only exists once hierarchy exists.

---

## Stage 0 — Audit

Before writing code, establish:

1. Does particle pooling exist? Where? Is it per-emitter or global?
2. Do particles carry a stable, monotonic ID? If not, what identifies them?
3. What is the exact renderer interface? Enumerate its lifecycle hooks.
4. How does `System.update()` order emitter updates today?
5. Is there any existing concept of emitter-to-emitter reference?
6. How are emitters serialised in the current JSON schema?

**Write the answers into this spec before proceeding.** Stages 1–4 assume answers
that may be wrong.

---

## Stage 1 — Pooling foundation

Pooling is currently a nice-to-have. After Stage 2 it is load-bearing: nested
emitters multiply cardinality (100 parents × 50 children = 5,000 particles and
100 emitter instances), and child instances must be recycled on parent death or
the system leaks.

**Deliverables:**

- A pool for particles (may already exist — see audit)
- A pool for **emitter instances** (new)
- Explicit `acquire()` / `release()` with no allocation in the hot path
- A global cap on live emitter instances, configurable, with a documented
  overflow policy (drop-newest is usually right for FX)
- Instrumentation: live counts for particles, emitter instances, pool hits/misses

**Acceptance:** a 60-second run of a nested system shows zero growth in heap
allocation attributable to particle or emitter instance churn.

---

## Stage 2 — The emitter tree

**Schema change.** `system.emitters[]` becomes a tree. Each emitter node gains
`children: Emitter[]`.

```jsonc
{
  "version": 2,
  "emitters": [
    {
      "id": "sparks",
      "rate": { /* ... */ },
      "initializers": [ /* ... */ ],
      "behaviours": [ /* ... */ ],
      "renderer": { "type": "sprite", /* ... */ },
      "children": [
        {
          "id": "spark-smoke",
          "inherit": { "position": "always", "rotation": "none", "scale": "none" },
          "rate": { /* ... */ },
          "renderer": { "type": "sprite", /* ... */ },
          "children": []
        }
      ]
    }
  ]
}
```

**Semantics:**

- A child emitter is **instantiated once per parent particle**, at that particle's
  spawn.
- The child instance's origin is the parent particle, not the system.
- The child instance is destroyed when its parent particle dies. Its already-emitted
  particles may either die with it or live out their lifetimes — this is a per-node
  flag, `orphanPolicy: "kill" | "detach"`. Default `detach` (a spark's smoke should
  outlive the spark).
- Update order is **topological**: a parent's particles must resolve before its
  children read their transforms. Depth-first is fine.

**Guards:**

- `maxDepth` — hard recursion limit. Self-triggering recursive nodes are a known
  hazard in any hierarchical particle system: every ancestor instance is retained
  until its last descendant dies, so an unbounded chain leaks until it exhausts
  memory. Cap depth (suggest 4) and cap total instances (Stage 1).
  *Prior art:* Effekseer permits recursion in its node tree — its documentation on
  instance retention is worth reading before designing this guard.
- Reject cycles at parse time.

**Acceptance:** a two-level system (sparks → smoke trails) renders correctly;
killing the system releases all child instances; instance count is bounded.

---

## Stage 3 — Inheritance modes

Per channel — `position`, `rotation`, `scale` — with three modes:

| Mode | Behaviour | Use |
|------|-----------|-----|
| `always` | Child continuously tracks parent particle | Trails, attached FX |
| `onCreate` | Child snapshots parent transform at spawn, then free | Ribbons, tracks, debris |
| `none` | Child ignores parent transform (system-space) | Rare; events |

`onCreate` vs `always` is the same hierarchy producing opposite looks from one
dropdown. It is the single highest-value nuance in this spec — do not skip it.

**Acceptance:** switching `position` from `always` to `onCreate` on the same
system visibly converts an attached trail into a left-behind band.

---

## Stage 4 — Ribbon and Trail renderers

**These are two different things and should be two renderers.** Conflating them
is a common mistake.

### `RibbonRenderer`

Connects **sibling particles of one emitter** into a continuous strip, in spawn
order. The particles are the spine.

- Requires stable spawn ordering (see 02 — particle IDs)
- Width driven by a curve over particle age
- Texture UV: `stretch` (U maps 0→1 across the whole ribbon) or `tile`
  (U repeats per segment). Both are needed; stretch is the common default.
- Geometry: triangle strip, camera-facing by default; optional axis-aligned
- Handle the degenerate cases: fewer than 2 live particles, particles at
  identical positions (zero-length segments produce NaN normals)

### `TrailRenderer`

Each particle keeps a **ring buffer of its own past positions** and renders a tail.
No sibling relationship.

- `trailLength` (samples) and `sampleInterval` (seconds) per particle
- Memory cost is `particles × trailLength × 3 floats` — must be pooled (Stage 1)
- Same width-over-age and UV modes as ribbon

**Which to build first:** Ribbon. It composes with Stage 3's `onCreate` mode to
give sword arcs, and it's cheaper. Trail is the fallback for when you want a tail
without a child emitter.

**Acceptance:** a child emitter with `inherit.position: "onCreate"` and a
`RibbonRenderer` produces a coherent band along the parent's path.

---

## Stage 5 — Events (deferred, scope permitting)

Distinct from attachment. Attachment = child lives alongside parent for its
lifetime (Stages 2–3). Events = a discrete trigger that spawns a burst which then
**outlives** the parent.

- `onDeath` → spawn burst at parent's final position
- `onCollision` → spawn burst at contact point

Fireworks want events. Trails want attachment. Ship attachment first; events are
a clean additive follow-on and should not block Stages 1–4.

---

## Notes for implementation

- Particles stay dumb. Nothing about hierarchy enters the particle struct except
  an ID (which 02 needs anyway). Child emitter instances hold the parent reference,
  not the other way round.
- The child instance is an *emitter*, not a *particle*. Do not try to model it as
  a special particle type.
- Every new random draw in this spec must go through the seeded PRNG from 02.
  Child instance seeds derive from `hash(systemSeed, emitterId, parentParticleId)`.
