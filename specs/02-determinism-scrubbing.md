# Spec 02 — Determinism & Scrubbing

Make the simulation reproducible: same seed + same step count = byte-identical
particle state, every time, on every machine running the same JS engine.

**Blocks:** 03 (sound jitter), and any offline/headless rendering built on the library
**Entangled with:** 01 (hierarchy) — child seeds derive from parent particle IDs

---

## Why this is not optional

Determinism looks like a nicety. It is actually the load-bearing property under
four separate product features:

1. **Reproducible rendering** — a headless render must match what was seen live.
2. **Offline rendering** — two renders of one system must be byte-identical.
3. **Seek and scrub** — step, rewind, edit-while-paused in any editing tool built
   on the library. The single most-used affordance in mature FX tooling.
4. **Programmatic iteration** — render → inspect → revise loops only work if the
   output is a pure function of the input.

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

### Findings (audited 2026-08-05, against `develop`)

1. **`Math.random` — 15 hits in `src/`.** In `behaviour/Force`, `initializer/Position`,
   `initializer/Velocity`, `math/MathUtils`, `math/Span`, and the zones (`LineZone`,
   `MeshZone`, `ScreenZone`, `SphereZone`). These are the only source of nondeterminism in
   the sim.
2. **No wall-clock reads in the sim.** Zero `Date.now` / `performance.now` / `new Date` in
   `src/`. So `Math.random` is the *sole* nondeterminism source — Stage 1 (seeded PRNG) is
   the entire determinism job on the RNG side.
3. **Raw single-step delta; no accumulator.** `System.update(delta = DEFAULT_SYSTEM_DELTA =
   0.0167)` takes one step of `delta` (→ `Emitter.update` → `Particle.update`); there is no
   fixed-timestep accumulator. Every consumer (sandbox, VR, website, the README/docs
   examples) calls `update()` **with no argument**, so the sim advances a fixed 1/60 *per
   call* — speed is tied to rAF frequency (120 Hz runs 2× fast) and degrades on dropped
   frames. The `delta` param already exists but is effectively unused, so Stage 3's
   accumulator can be added **backward-compatibly**: no-arg `update()` stays "one fixed
   step"; `update(realDt)` opts into sub-stepping.
4. **Particles have IDs — frame-stable but NOT reproducible.** `Particle.id` is set once at
   construction to `` `particle-${uid()}` `` where `uid` is **uuid v1** (time + node +
   random). So IDs are stable across frames ✓ but differ every run ✗. Stage 2 / the 01
   child-seed entanglement needs a **deterministic** ID (seeded counter or PRNG-derived),
   not uuid v1 — this is the concrete piece 01 depends on.
5. **No order-dependent iteration in the sim path.** Emitters and particles are stored in
   **arrays** and iterated by index (`while (i--)`); no `Set` / `Map` / `Object.keys` in the
   core / emitter / behaviour / initializer sim path. The only `forEach` are array
   iterations in `fromJSON` / `fromJSONAsync` during load (order-stable). No hazard found.
6. **No seed handling in the library.** `seedrandom` appears **only** in `vr/main.js`, which
   achieves determinism by globally monkeypatching `Math.random` (`seedrandom(seed, {global:
   true})`) — a harness hack, not a library capability.

**Two consequences for sequencing:**

- **Passing real `dt` is a safe, additive change for consumers.** Nobody passes the arg
  today and the signature already accepts it, so the accumulator (Stage 3) can land without
  breaking existing no-arg callers.
- **The change with teeth is the PRNG swap (Stage 1).** Replacing the 15 `Math.random` calls
  with a seeded generator changes the default random stream, so the VR harness must switch
  from monkeypatching global `Math.random` to seeding the library PRNG, and the golden-master
  baselines **will shift and need re-capturing** (same drill as the #293 atlas fix). Sequence
  the RNG change with a deliberate VR re-baseline.

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
display, and rendering offline at a different fps produces a different effect.

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

## Stage 6 — Headless contract

Determinism is necessary but not sufficient for offline rendering. The system must
also be *drivable from outside*, with no environmental dependencies.

Consumers that step the library headlessly — in a Web Worker against an
`OffscreenCanvas`, or under headless Chromium — are out of scope for this repo, but
the contract that makes them possible is not.

**Requirements:**

- **The library never owns a loop.** No internal `requestAnimationFrame`. The caller
  supplies `dt` and decides when to advance. (Verify in Stage 0 — this may already
  hold.)
- **No wall-clock reads in the sim path.** Covered by Stage 3, restated here because
  it is the requirement that breaks headless stepping when violated.
- **Simulation and rendering are separable.** A caller must be able to step N times
  without rendering, or render the same state twice, in any order.
- **No DOM access in the sim path.** No `document`, no `window`, no
  `HTMLImageElement`. Textures arrive as decoded data via the resolver (05), not as
  DOM elements. This is the requirement most likely to be quietly violated today.
- **No `HTMLCanvasElement` assumption.** Anything canvas-shaped must accept an
  `OffscreenCanvas`.

**Acceptance:** a system steps 600 times inside a Web Worker with no DOM present,
and produces particle state digests identical to the same run on the main thread.

**Explicitly not this repo's job:** frame capture, sprite-sheet packing, video
encoding, camera framing, warmup heuristics, loop-point selection, CLI, queueing.
Those belong to whatever consumes this contract.

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

## Consumer impact & isolation

The seeded PRNG is **additive and non-breaking**:

- **`rng` is optional with a `Math.random()` fallback** at every draw site.
  Built-in units always receive the engine's seeded stream (deterministic);
  custom code or direct calls that pass no `rng` fall back to `Math.random` and
  behave exactly as today. Constructors are unchanged; there is nothing to migrate.
- **The seed defaults to random** at system creation, so systems still vary
  run-to-run by default. Reproducibility is opt-in: `new System({ seed })` /
  `setSeed()`.
- **Isolation is a fix, not just a feature.** Built-ins stop calling
  `Math.random()`, so the engine no longer draws from — and perturbs — the global
  RNG stream. A consumer who seeds `Math.random` globally for their own
  determinism is *currently* disturbed by particle draws; after Stage 1 they are
  not. Each system's stream is per-system and independent of the host's.
- **Optional alignment.** A consumer running their own seeded sim can fold the
  visuals into their reproducible world by passing their seed:
  `new System({ seed: yourRng.int32() })`. Never required — the two determinisms
  are orthogonal.
- **Boundary.** Determinism is within one JS engine on one platform (reproducible
  replays/previews), not cross-runtime float-exact (lockstep netcode). Particles
  are visual state; keep them on the presentation side of a netcode boundary.

---

## Explicitly out of scope

- Cross-runtime determinism (three-nebula ↔ a port to another engine)
- Rewind / reverse simulation
- Deterministic GPU simulation (revisit if/when a compute path exists)
