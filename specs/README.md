# three-nebula Modernisation — Spec Index

## Purpose

Specs covering modernisation work for the three-nebula library — 01–05 are
runtime features/architecture; 07 adds WebGPU support. (06, the TypeScript
migration, is complete and its spec has been removed.)

**The numbers are identifiers, not execution order.** See the dependency graph below.

## Specs

| # | Spec | Shape |
|---|------|-------|
| 01 | Emitter Hierarchy (nested emitters, ribbon/trail renderer, pooling) | New capability, additive |
| 02 | Determinism & Scrubbing | Architecture, invisible, blocking |
| 03 | Sound Renderer | New capability, additive |
| 04 | Schema Versioning | Architecture, hygiene (not gating) |
| 05 | Content-Addressed Assets | New capability, additive |
| 07 | WebGPU Support (renderers under three's `WebGPURenderer`; a TSL/node `GPURenderer` from the `three-nebula/webgpu` subpath) | New capability + packaging, opt-in/additive |

## Dependency graph

```
02 (determinism) ──soft──> 01 (hierarchy)

02 (determinism) ──┐
                   ├──> 03 (sound)
05 (assets) ───────┘

04 (versioning) — standalone hygiene; gates nothing
```

**Hard constraints:**

- **01 and 05 are additive, not schema breaks.** 01 adds an optional
  `children[]` to each emitter (absent = today's flat, leaf emitter); 05 adds an
  optional `textureRef` alongside the **untouched** base64 `texture`. Existing
  systems load unchanged either way, so neither strands data.
- **04 is hygiene, not a prerequisite.** Because 01 and 05 are additive, nothing
  hard-depends on schema versioning. The `version` stamp is cheap and worth adding
  whenever convenient, but it only *earns its keep* if a genuinely non-additive
  change ever lands. Do not treat it as a blocker for 01 or 05.
- **02 entangles with 01 (soft).** Child emitter instances need seeds derived from
  the parent particle's ID. Landing 01 without 02 means touching every initializer
  and behaviour's seeding twice — do 02 first to avoid the rework. Efficiency, not
  correctness.
- **03 depends on 02** for jitter (pitch/offset randomisation must be seeded) and
  on **05** for audio blobs (which reuse 05's `{ hash, mime }` ref + resolver).

Suggested landing order: **02 → 01 → 05 → 03**, with 04's `version` stamp folded
in cheaply whenever (it gates nothing).

03 (sound) is deliberately last: it is the most additive and least entangled,
and it is the easiest to defer if time runs short.

## On prior art

Several specs cite existing FX tools — PopcornFX, Niagara, Effekseer, glTF — where
they solved a problem first and solved it well. These are **references, not
comparisons**: the point is to learn from work that's already been done rather than
rediscover it, and to give an implementer somewhere concrete to read.

Where a design here differs from prior art, that's a deliberate choice and the
reasoning is stated. Where it copies, that's also deliberate.

## Assumptions flagged for verification

These specs were written without repo access. Every spec contains an
**Audit** stage as Stage 0. Claude Code should run those audits first and
correct the specs before implementation. In particular, the following are
**guesses** and may already be solved:

- Whether particle pooling exists and how it works
- Whether a seeded PRNG exists, or whether `Math.random()` is called directly
- Whether particles carry a stable ID
- Whether flipbook / sprite-sheet playback already exists in some form
- The current renderer interface's exact lifecycle hooks
- Whether the sim uses a fixed timestep or raw delta

If the audits contradict a spec, **trust the repo**.

## Out of scope

- Anything outside the three-nebula library itself
- Applications built on top of the library
- Backend, hosting, or distribution infrastructure
- **Offline rendering / baking.** Stepping a system headlessly and encoding the
  frames to sheets or video is a *consumer* of this library, not a feature of it:
  it needs `reset()`, `step()` and determinism (02) and nothing else from the
  runtime. The rest is three.js, canvas and WebCodecs. The library's only
  obligation is the headless contract in **02, Stage 6**.
