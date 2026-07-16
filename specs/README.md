# three-nebula Modernisation — Spec Index

## Purpose

Six specs covering the runtime work needed before the web editor and social gallery
can be built on top of three-nebula.

**The numbers are identifiers, not execution order.** See the dependency graph below.

## Specs

| # | Spec | Shape |
|---|------|-------|
| 01 | Emitter Hierarchy (nested emitters, ribbon/trail renderer, pooling) | New capability + schema break |
| 02 | Determinism & Scrubbing | Architecture, invisible, blocking |
| 03 | Sound Renderer | New capability, additive |
| 04 | Schema Versioning | Architecture, enabling |
| 05 | Content-Addressed Assets | Architecture + schema break |
| 06 | Baking | New subsystem, sits above runtime |

## Dependency graph

```
04 (versioning) ──┬──> 01 (hierarchy)  ──> 06 (baking)
                  │         ▲                  ▲
                  └──> 05 (assets)             │
                            ▲                  │
02 (determinism) ───────────┴──────────────────┘
                            │
                            └──> 03 (sound)
```

**Hard constraints:**

- **04 lands first.** Both 01 and 05 break the JSON schema. Without a migration
  path in place, every existing saved system is stranded. 04 is small and boring
  and must precede both.
- **02 entangles with 01.** Child emitter instances need seeds derived from the
  parent particle's ID. Landing 01 without 02 means touching every initializer
  and behaviour twice.
- **06 depends on 02.** A non-deterministic sim cannot be baked reproducibly —
  the thumbnail won't match the preview, and two bakes of the same system differ.
- **03 depends on 02** for jitter (pitch/offset randomisation must be seeded) and
  on **05** for audio blob storage.

Suggested landing order: **04 → 02 → 01 → 05 → 06 → 03**

03 (sound) is deliberately last: it is the most additive and least entangled,
and it is the easiest to defer if time runs short.

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

- Editor work (the NW.js → browser port)
- Gallery / backend / auth
- Anything to do with pricing or Pro tiering
