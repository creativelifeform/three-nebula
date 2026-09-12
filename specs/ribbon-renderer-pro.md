# Task Spec — RibbonRenderer, pro tier (spline subdivision + twist-free frames)

**Type:** feature — RibbonRenderer quality. Follow-up.
**Status:** filed, not scheduled.
**Builds on:** the shipped RibbonRenderer + its polish (softEdge, tangent
smoothing, coincident-point dedup).

---

## Problem

After the polish fixes the RibbonRenderer is smooth for *well-behaved* effects,
but two limitations remain — both solved in production trail/ribbon renderers:

1. **Spine resolution = one distinct point per sim frame.** A fast-moving emitter
   makes a coarse polygon (visible faceting), because the ribbon is only as smooth
   as the number of distinct particle positions. Dedup removed the *ribs* from
   bursts, but not the faceting from a sparse spine.
2. **Orientation can twist / flip.** The strip's side vector is derived per-point;
   the current guard just flips it when the cross product changes sign (a crude
   stand-in). On curves that turn toward the camera this still flares/twists.

## Proposed

### 1. Spline subdivision (resolution-independent smoothness)

Fit a **Catmull-Rom spline** through the deduped spine points and tessellate it
`subdivisions`× per segment, interpolating position (and colour / alpha / width)
along the curve. The strip is then smooth regardless of how few particles feed it.

- Option `subdivisions: number` (default 1 = off, backward-compatible).
- Buffers scale by the factor; keep the grow-only pooling.
- Deterministic (analytic interpolation).

### 2. Rotation-minimizing frames (twist-free orientation)

Replace the sign-flip heuristic with a **rotation-minimizing frame** propagated
along the spine (double-reflection RMF, Wang et al.) — a stable, twist-free frame.
Fixes both the twist on tight curves and the edge-on flare of the camera-facing
mode. For camera-facing, blend the RMF's side toward the view-perpendicular.

### 3. (Optional) velocity-based tangents

When a particle carries a meaningful velocity, use it as the tangent instead of
neighbour-differencing — smoother, and correct at the ends.

## Prior art (these are standard techniques)

- **Minimum vertex distance** (Unity `TrailRenderer`) — already covered by our
  coincident-point dedup.
- **Tessellation / curve tension** (Unreal Niagara ribbons), spline trails
  (Catmull-Rom) — item 1.
- **Rotation-minimizing frames / parallel transport** — the textbook fix for
  twist-free tubes/ribbons along a curve — item 2.

## Acceptance

- A fast-spinning ribbon (e.g. the `ribbon-spiral` sandbox at a high spin rate)
  renders smooth, no faceting, at default emission.
- A ribbon whose curve turns toward the camera shows no flare/twist.
- Existing ribbons are unchanged with `subdivisions: 1` and the RMF reducing to
  the current behaviour on straight spines.
- Deterministic; tests for the subdivision vertex count and a twist-free frame on
  a known curve.

## Risk / notes

- Additive / opt-in (subdivisions default 1); the RMF replaces an internal
  heuristic, so verify it matches on the existing RibbonRenderer tests.
- Watch buffer sizing (scales by subdivisions) and per-frame cost.
- Miter/inner-edge handling for very wide ribbons on sharp turns is a further,
  separate refinement (out of scope here).
