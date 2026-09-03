# Task Spec — Emitter Collision Events (`trigger: 'collision'`)

**Type:** feature — extends spec 01 (emitter hierarchy), Stage 5 (events).
**Status:** filed follow-up, not scheduled.
**Depends on:** spec 01 Stage 5 shipped (`trigger: 'spawn' | 'death'`).

---

## Problem

Spec 01 Stage 5 introduced event-triggered child bursts and shipped `death`
(burst at parent-particle death). It named `onCollision` as the other event but
did not implement it. This spec captures it.

Correction to an earlier note: three-nebula **does** have collision detection —
`src/behaviour/Collision.ts` — so this is not blocked by a missing system.

## What already exists

`Collision` (behaviour, code-only):

- Particle-vs-particle within one emitter (or a supplied particle list). Detects
  **radius overlap** (`|Δ|² ≤ (rA + rB)²`), pushes the pair apart (mass-weighted),
  and calls a user callback **`onCollide(particle, otherParticle)`** — the exact
  hook a collision burst fires from.
- `O(n²)` per emitter.
- `Collision.fromJSON` is a **no-op TODO** → not JSON-serialisable; constructed in
  code with an emitter reference + callback.

## Design

A child node with `trigger: 'collision'` bursts at the **contact point** (midpoint
of the two colliding particles), reusing the Stage 5 event machinery.

- Fire from the collision moment, not the death sweep: instance the child, set its
  position to `(a.position + b.position) * 0.5`, hand it to
  `System._detachInstance(inst, /* stopEmitting */ false)` so its one-shot burst
  fires then drains and releases (identical to `_triggerDeathChildren`).
- Wiring: an emitter with `collision`-trigger children needs collision detection
  over its own particles. Either (a) internally run the `Collision` overlap test
  and fire on overlap, or (b) drive it from a `Collision` behaviour's `onCollide`.
  Prefer (a) so the trigger is self-contained and doesn't require the consumer to
  wire a callback.

### The debounce problem (the crux)

An overlapping pair stays overlapping for several frames, so the naive collision
hook fires **every frame** → burst spam. Needed: fire **once per collision event**.
Options:
- Mark a particle as "collided" (a flag/tag) and skip re-triggering while still
  overlapping; clear when separation resumes.
- Or fire once per unordered pair per frame and rate-limit per particle.
Pick and document one; without it the feature is unusable.

## Stage 0 — Audit (before implementing)

1. Confirm `Collision.onCollide` fires per overlapping pair per frame (it does,
   per `mutate`), and whether both `(a,b)` and `(b,a)` fire (dedupe if so).
2. Confirm the contact midpoint is meaningful given `Collision` *moves* particles
   apart in the same `mutate` — capture positions before the separation nudge.
3. Decide whether `collision` children count toward `maxDepth` / the instance cap
   (they should — same as `death`).

## Acceptance

- Two particles that overlap spawn exactly **one** burst at their contact point,
  not one per frame of overlap.
- The burst outlives both particles and drains/releases (no leak), like `death`.
- Deterministic for a fixed seed (contact ordering must be stable).
- `spawn` / `death` behaviour unchanged.

## Risks / notes

- **Particle-particle only** — overlap between an emitter's own particles, not
  collision with the ground / a zone / world geometry. "Spark hits floor" is a
  different feature (would need zone/plane collision).
- **Cost:** `O(n²)`; document it and keep it opt-in.
- **JSON:** `Collision.fromJSON` is a stub, so a JSON `trigger: 'collision'` needs
  its own internal detection rather than leaning on the public behaviour. v1 may
  ship code-only (set `emitter.trigger = 'collision'` in code) and defer the JSON
  surface until `Collision` is serialisable.
- **Semver:** additive (new enum value + opt-in) → minor.
