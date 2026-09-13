# Task Spec — Parametric Emission Zones (Ring / Disc / Cone / Cylinder)

**Type:** feature — new zones. Fast-follow (unblocks AoE spell shapes).
**Motivation:** surfaced while designing spell effects on top of the emitter hierarchy.

---

## Problem

Emission zones are `PointZone`, `BoxZone`, `SphereZone`, `LineZone`, `MeshZone`,
`ScreenZone`. There is no parametric **Ring/Disc/Cone/Cylinder**, which gates a
whole category of RPG spell shapes:

- **Ring / Disc** — frost novas, expanding shockwave rings, AoE ground indicators,
  summoning circles.
- **Cone** — dragon's breath, cone of cold, spray/flamethrower.
- **Cylinder** — pillars/columns of light or fire, beam volumes.

Today these are faked with `MeshZone` (author a ring/cone mesh — clunky, needs
asset authoring) or by placing particles with hand-written math.

## Proposed

New **zones** — kept as zones, not a separate "shape" type (see *Terminology*
below) — each implementing the existing Zone contract: `getPosition()` with
**uniform** sampling, plus the `_dead`/`_bound`/`_cross` boundary methods, **with
the solid-vs-planar caveat below**.

```
new RingZone(center: Vector3D, innerRadius, outerRadius, axis = +Y)   // annulus in a plane  (planar)
new DiscZone(center: Vector3D, radius, axis = +Y)                     // filled circle (RingZone inner=0)  (planar)
new ConeZone(apex: Vector3D, direction: Vector3D, angle°, length)     // solid cone (breath/spray)  (solid)
new CylinderZone(center: Vector3D, radius, height, axis = +Y)         // solid cylinder (pillar/beam)  (solid)
```

Uniform sampling notes (avoid clustering at the centre):
- Disc/Ring: `r = sqrt(lerp(inner², outer², u))`, `θ = 2πv`.
- Cone: sample along length, radius scales with distance from apex.

### Solid vs planar — boundary behaviour differs

The four are not uniform in dimensionality, and that changes what `CrossZone`
(dead/bound/cross) can mean:

- **Solid volumes — `ConeZone`, `CylinderZone`:** have a well-defined
  inside/outside test, so they are **full boundaries** — implement
  `_dead`/`_bound`/`_cross` properly; they work as both emission shapes and
  `CrossZone` boundaries.
- **Planar zones — `RingZone`, `DiscZone`:** zero thickness, so "is the particle
  inside a flat disc?" is degenerate for bounce/wrap. These are **emission-first**:
  implement `getPosition` fully, but make the boundary methods a documented no-op
  (or a thin planar test) rather than pretend they are 3D volumes. Do **not** ship
  a `DiscZone` that behaves unpredictably under `CrossZone`.

## Stage 0 — Audit (before implementing)

1. Read the `Zone` base class and an existing zone (e.g. `SphereZone`) for the
   exact method surface `getPosition` / `getPosition3D` / `_dead` / `_bound` /
   `_cross` and how `Position` and `CrossZone` consume it.
2. **Determinism (spec 02):** check whether zone sampling currently draws from
   `Math.random` (via `MathUtils.randomFloating`) or a threaded seeded `rng`. New
   zones must sample from the seeded stream so `setSeed` output stays reproducible
   — align with however the initializers thread `particle.rng`.
3. Confirm axis handling (arbitrary axis vs. axis-aligned) — a `+Y` default with
   an optional axis is enough for v1; full arbitrary-axis can follow.

## Acceptance

- Each zone samples uniformly within its shape; visualised in a sandbox demo.
- All four work as a `Position` initializer.
- **Solid zones (Cone, Cylinder) work as a `CrossZone` boundary; planar zones
  (Ring, Disc) are emission-first — boundary methods no-op / documented, not
  broken.**
- Deterministic for a fixed seed.

## Terminology — kept as "Zone", not "Shape"

These are `Zone`s, deliberately — not a new "shape" abstraction. Unity/Niagara
call the emission-source module "Shape" and couple it to the emitter;
three-nebula's `Zone` is a **standalone geometric region** consumed by *both* the
`Position` initializer (emission) *and* the `CrossZone` behaviour (boundary). That
decoupling is the reason to build these as zones (one implementation serves both
uses) and the reason "zone" is the more accurate name. Keep the term throughout
code, docs, and editor — intentional differentiation over 1:1 parity with other
tools.

## Notes

- A crisp expanding shockwave *ring mesh* (a scaling textured torus) is a separate,
  consumer-side (three.js) technique; this spec is about particle *emission* shapes.
- Workaround until shipped: `MeshZone` with a ring/cone mesh, or emit-on-circle
  math in the effect file.
