# Spec 02 — Determinism & Scrubbing

Make the simulation reproducible: same seed + same step count = byte-identical
particle state, every time, on every machine running the same JS engine.

**Entangled with:** 01 (hierarchy) — child seeds derive from parent particle IDs

---

## Why this is not optional

Determinism looks like a nicety. It is actually the load-bearing property under
four separate product features:

1. **Gallery thumbnails** must match what the user saw when they published.
2. **Baked export** — two bakes of the same system must be identical
3. **Nebula Editor scrubbing** — seek, step, edit-while-paused. The single most-used
   affordance in commercial FX editors.
4. **AI generation loop** — generate → bake N frames → critique → revise only
   works if the render is a function of the JSON.

Retrofitting determinism means touching every initializer and behaviour. Doing it
while already in there for 01 costs a fraction.

---

## Stage 0 — Audit

1. Grep for `Math.random`. Every hit is a defect. Count them.
2. Grep for `Date.now`, `performance.now`, `new Date` inside the sim path.
3. Does the sim use a fixed timestep or raw `delta` from rAF?
4. Do particles have IDs? Are they stable across frames?
5. Is there any iteration over `Set` / `Map` / `Object.keys` whose order affects
   simulation output?
6. Is there existing seed handling anywhere?

---

## Stage 1 — Seeded PRNG

Replace all `Math.random()` with an injected, seedable generator.

- Suggested: `mulberry32` or `xoshiro128**`. Small state, fast, good enough
  distribution for FX. Do not use anything cryptographic.
- The PRNG instance must be reachable from every initializer, behaviour, and
  renderer that draws randomness. Pass it down; do not use a module singleton
  (two systems on one page must not share a stream).

**Acceptance:** `grep -r "Math.random" src/` returns zero hits in the sim path.

---

## Stage 2 — Seed derivation hierarchy

Randomness must be *addressable*, not merely seeded. A single sequential stream
breaks the moment emitters update in a different order.

```
systemSeed                         (user-set or random at creation)
  └─ emitterSeed   = hash(systemSeed, emitterId)
       └─ particleSeed = hash(emitterSeed, particleId)
            └─ childEmitterSeed = hash(systemSeed, childEmitterId, particleId)
```

- `particleId` — monotonic counter per emitter, never reused, survives pooling
  (i.e. a recycled particle object gets a *new* ID)
- Each particle carries its own PRNG state, seeded from `particleSeed`
- This is what makes 01's child emitters reproducible: the child's stream is a
  pure function of which parent particle it rides

**Acceptance:** reordering emitters in the JSON does not change any individual
emitter's output.

---

## Stage 3 — Fixed timestep

The sim must advance in fixed increments, decoupled from rAF.

- Accumulator pattern: accumulate real delta, consume in fixed steps
  (suggest 1/60s, configurable)
- Clamp max steps per frame to avoid spiral-of-death on a slow frame
- Optionally interpolate render state between steps (defer — not needed for v1)

Without this, the same system produces different results on a 60Hz and a 144Hz
display, and baking at a different fps produces a different effect.

**Acceptance:** stepping the sim 600× at 1/60 produces identical state regardless
of wall-clock time taken.

---

## Stage 4 — Seek / scrub

**You cannot run a stochastic sim backwards.** Do not try.

Seek is implemented as **reset + fast-forward**:

```
seek(t):
  reset to step 0 with the same seed
  run ceil(t / dt) fixed steps with rendering disabled
```

- Forward seek from the current position is an optimisation, not a requirement —
  correctness first
- **Checkpointing** (snapshot full particle state every N steps, restore + replay
  the remainder) is the obvious speed-up if seek becomes slow. Defer until measured.
- Scrubbing must not fire audio (see 03) or any other side effect
- Expose `step()`, `seek(t)`, `reset()`, `setTimeScale()` on the system

**Acceptance:** `seek(2.0)` twice from different starting states produces
identical particle buffers.

---

## Stage 5 — The determinism test

This is the deliverable that keeps the property from rotting.

- Hash the full particle buffer (positions, velocities, colors, ages) at
  step N into a stable digest
- Golden-file test: a corpus of systems, each with an expected digest at several
  step counts
- Run in CI. Any change that breaks a digest is either a bug or an intentional
  change requiring a new golden file
- Include at least one nested system once 01 lands

**Acceptance:** CI fails if determinism regresses.

---

## Known non-determinism sources to eliminate

| Source | Fix |
|--------|-----|
| `Math.random()` | Seeded PRNG (Stage 1) |
| `Date.now()` / `performance.now()` in sim | Fixed timestep (Stage 3) |
| Variable rAF delta | Fixed timestep (Stage 3) |
| `Set`/`Map` iteration order | Sort, or use arrays |
| Pool reuse order affecting IDs | IDs from a counter, not pool index |
| Async texture load racing spawn | Resolve all assets before first step |

**Not a concern:** IEEE-754 float behaviour is deterministic within a given JS
engine on a given platform. Cross-platform float divergence matters for lockstep
netcode, not for this. Do not over-engineer.

---

## Explicitly out of scope

- Cross-engine determinism (three-nebula ↔ some future Unity runtime)
- Rewind / reverse simulation
- Deterministic GPU simulation (revisit if/when a compute path exists)
