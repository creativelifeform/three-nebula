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

New zones, each implementing the existing Zone contract (`getPosition()` with
**uniform** sampling, plus the crossing/`_dead`/`_bound`/`_cross` methods the
other zones provide so `CrossZone` works):

```
new RingZone(center: Vector3D, innerRadius, outerRadius, axis = +Y)   // annulus in a plane
new DiscZone(center: Vector3D, radius, axis = +Y)                     // filled circle (RingZone inner=0)
new ConeZone(apex: Vector3D, direction: Vector3D, angle°, length)     // solid cone (breath/spray)
new CylinderZone(center: Vector3D, radius, height, axis = +Y)         // solid cylinder (pillar/beam)
```

Uniform sampling notes (avoid clustering at the centre):
- Disc/Ring: `r = sqrt(lerp(inner², outer², u))`, `θ = 2πv`.
- Cone: sample along length, radius scales with distance from apex.

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
- Works as a `Position` initializer and a `CrossZone` boundary.
- Deterministic for a fixed seed.

## Notes

- A crisp expanding shockwave *ring mesh* (a scaling textured torus) is a separate,
  consumer-side (three.js) technique; this spec is about particle *emission* shapes.
- Workaround until shipped: `MeshZone` with a ring/cone mesh, or emit-on-circle
  math in the effect file.
