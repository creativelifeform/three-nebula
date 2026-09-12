# Task Spec — Swirl / Curl Force Field Behaviour

**Type:** feature — new behaviour(s). Fast-follow (unblocks convincing magic VFX).
**Motivation:** surfaced while designing spell effects on top of the emitter hierarchy.

---

## Problem

three-nebula's force vocabulary is **radial point forces** (`Attraction`,
`Repulsion`, `Spring`), **constant** (`Force`, `Gravity`), and **random jitter**
(`RandomDrift`). There is no *coherent* swirling / flowing field. This is the #1
limiter on organic effects — swirling energy, roiling smoke, licking flame,
vortices, magic "charge-up." Everything currently reads as drift + radial pull,
not flow.

## Proposed — two tiers

### 1. `Vortex` (analytic, cheap, deterministic) — ship first

A tangential force around an axis, with optional inward/outward pull and radial
falloff. Deterministic by construction (no randomness).

```
new Vortex(center: Vector3D, axis: Vector3D, swirl: number, pull = 0, falloff = 1)
```
- tangential = `axis × radial`, scaled by `swirl` and a `1/dist^falloff` core tightening
- `pull` adds inward (+) / outward (−) radial force
- Apply to `particle.velocity` directly (NOT `acceleration` — avoids the `Force`
  ×100 MEASURE scaling; keep magnitudes intuitive)

Covers: vortices, spell charge-up (inward spiral), tornados, orbiting motes,
swirling auras. A working stand-in already exists in the `nebula-recipes` skill as
a custom `Behaviour` subclass — promote it to a first-class, tested behaviour.

### 2. `CurlNoise` (procedural flow) — follow-on

Velocity from the **curl of a seeded noise field** — the standard for organic
turbulence (smoke, fire, dust, energy). `new CurlNoise(scale, strength, seed?)`.
- Curl of noise is divergence-free → natural, roiling, non-clumping motion.
- **Must use the seeded PRNG** (`mulberry32`/`hashSeed`, spec 02), NOT `Math.random`,
  so output stays deterministic. Seed derives from the system/emitter seed.

## Acceptance

- `Vortex`: particles swirl coherently around the axis; `pull` tightens/loosens the
  spiral; fully deterministic; opt-in behaviour, no effect unless added.
- `CurlNoise`: visibly organic, non-clumping flow; identical output for a fixed seed.
- Both documented with a sandbox demo.

## Notes / audit

- Decide velocity-delta vs acceleration application consistently (the recipe uses
  velocity to dodge the ×100 `Force` scaling — document whichever is chosen).
- Consider a shared "field" concept later (multiple particles sampling one field),
  but per-behaviour `mutate` is fine for v1.
- Workaround until shipped: the custom `Vortex` behaviour in `nebula-recipes`
  (effect-file-local, no library change).
