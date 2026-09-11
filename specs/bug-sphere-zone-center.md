# Bug / Task Spec — `SphereZone` ignores `centerY` and `centerZ`

**Type:** bug fix
**Scope:** `src/zone/SphereZone.ts` — standalone, off `develop`. Unrelated to the
emitter-hierarchy stack (surfaced while building its sandbox demo).

---

## Summary

The four-argument constructor `new SphereZone(centerX, centerY, centerZ, radius)`
collapses the sphere centre to `(centerX, centerX, centerX)`. `centerY` and
`centerZ` are silently ignored — the X value is copied onto all three axes. Only
`radius` is honoured.

## Location

`src/zone/SphereZone.ts`, constructor:

```ts
let x = 0;
let r = 100;

if (Util.isUndefined(centerY, centerZ, radius)) {
  r = centerX || 100;          // single-arg form: SphereZone(radius)
} else {
  x = centerX as number;       // centerY and centerZ are never read
  r = radius as number;
}

this.x = x;

// TODO shouldn't this be set to y?
this.y = x;                    // BUG — should be centerY

// TODO shouldn't this be set to z?
this.z = x;                    // BUG — should be centerZ
this.radius = r;
```

The in-file `TODO`s already flag both lines.

## Current vs expected behaviour

| Call | Current centre | Expected centre |
|------|----------------|-----------------|
| `new SphereZone(50, -120, 30, 45)` | `(50, 50, 50)`, r=45 | `(50, -120, 30)`, r=45 |
| `new SphereZone(45)` (single-arg) | `(0, 0, 0)`, r=45 ✓ | unchanged |

The single-argument form is correct and is the only form currently used in the
repo (e.g. the WebGPU sandbox: `new SphereZone(20)`), which is why the bug has
gone unnoticed.

## Reproduction

```js
const z = new SphereZone(0, 100, 0, 20);
console.log(z.x, z.y, z.z); // 0 0 0   (expected 0 100 0)
```

## Root cause

In the four-arg branch only `x` and `r` are assigned; `this.y` / `this.z` are then
hardcoded to `x`. No locals are ever taken from `centerY` / `centerZ`.

## Proposed fix

```ts
let x = 0;
let y = 0;
let z = 0;
let r = 100;

if (Util.isUndefined(centerY, centerZ, radius)) {
  r = centerX || 100;
} else {
  x = centerX as number;
  y = centerY as number;
  z = centerZ as number;
  r = radius as number;
}

this.x = x;
this.y = y;
this.z = z;
this.radius = r;
```

## Risk / determinism

This changes observable output for any system using the four-arg form (particles
spawn at the corrected centre). Under the golden-master / VR-baseline regime:

1. `grep -rn "SphereZone(" test/ sandbox/ src/` for multi-arg usages.
2. If any fixture or VR baseline uses a non-origin `SphereZone`, regenerate the
   baselines as part of the fix.
3. Single-arg usage (all current in-repo usage) is unaffected — centre stays
   `(0,0,0)`.

**Semver:** a bug fix, but it changes observable output, so treat as at least a
minor and note it in `CHANGELOG.md`.

## Acceptance criteria

- `new SphereZone(a, b, c, r)` produces centre `(a, b, c)`, radius `r`.
- `new SphereZone(r)` unchanged: centre `(0,0,0)`, radius `r`.
- Unit test in `test/zone/` covering both the single-arg and four-arg forms.
- `tsc` / lint / tests green; VR baselines regenerated only if a fixture is
  affected (expected: none).

## Notes

- The healing-aura sandbox experiment works around this by putting the *emitter*
  at the base (`setPosition({ y: -120 })`) and using the origin-centred
  `new SphereZone(45)`. Once fixed, that could pass the centre to the zone directly.
- Same file: the fields `this.the` / `this.phi` look like a typo for `theta` /
  `phi`. They are internally consistent (used by the sphere-sampling maths), so
  this is cosmetic and **out of scope** for this fix — mention only.
