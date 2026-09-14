# Task Spec — Distance-based emission (uniform trail spacing)

**Type:** feature — emission / `Rate`. Follow-up.
**Status:** filed, not scheduled.
**Depends on:** nothing. Renderer-agnostic (works on the current GPURenderer).

---

## Problem

`Rate` today is **time-based**: emit N particles every T seconds. For a *trail*
(an emitter or trail-child that rides a moving particle), that makes the spacing
between shed samples `speed × interval` — so a fast head leaves **big gaps** and a
slow head leaves **tight clusters**. The result is the familiar trail **banding**,
and it is *speed-dependent*: you can't tune it away with a fixed rate because the
head's speed varies along its path (fastest just after launch).

## Proposed

A **distance-based emission** mode: emit one sample every **X world-units
travelled** by the emitter, instead of every X seconds. Spacing becomes **uniform
regardless of speed**, which removes the *cause* of variable banding rather than
masking it. (This is the inverse of Unity's `TrailRenderer` "min vertex distance",
and the classic fix for ribbon/trail sampling.)

Sketch:

```
new Rate(perStep, distance)        // or a RateMode / DistanceRate
// emit `perStep` particles each time the emitter has moved `distance` world-units
```

- Track the emitter's accumulated displacement between updates; when it exceeds
  `distance`, emit and carry the remainder (so it stays frame-rate independent and
  deterministic — no drift from variable `dt`).
- Applies to a moving emitter (e.g. a hierarchy trail child with
  `inherit: position: always`, which rides its parent particle).
- Keep it additive: existing time-based `Rate` is unchanged and remains the
  default.

## Why this is the low-risk universal smoothness lever

Unlike **[[velocity-stretched-sprites]]**, this changes only **when** particles
spawn, not **how they are drawn** — so it is fully **compatible with the current
`GPURenderer`** (`THREE.Points`) with no instanced-quad migration and no VR
re-baseline of the draw path. It is the cheapest "smooth trails everywhere" win.

Levers compared (all three compose):

- **distance-based emission** — uniform spacing at the source; renderer-agnostic,
  ships today. *Fixes the cause.*
- **velocity-stretched sprites** — bridges gaps per-particle at draw time; premium,
  gated on instanced quads for GPU.
- **ribbon-renderer-pro** (spline subdivision) — resolution-independent smoothness
  for the *one-coherent-path* case.

## Acceptance

- A trail child riding a variable-speed head lays down **evenly spaced** samples
  (uniform gap) whether the head is fast or slow — no clustering, no big gaps.
- Deterministic for a fixed seed (displacement accumulator carries the remainder;
  no dependence on frame `dt`).
- Time-based `Rate` output is unchanged (backward-compatible; opt-in mode).
- Works with the existing `GPURenderer` unchanged.

## Notes

- Determinism (spec 02): the accumulator must be pure sim state so `setSeed`
  reproducibility holds; no wall-clock, no `Math.random`.
- Surfaced by the `curl-particles` / trail work: the banding there was
  `speed × interval` spacing from time-based emission.
- Composes with velocity-stretch: uniform spacing + a small per-particle stretch
  needs far less stretch to look continuous.
