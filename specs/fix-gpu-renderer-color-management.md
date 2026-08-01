# Fix — GPURenderer additive particles render dim under three's sRGB color management (r152+)

**Status:** Not started. **Diagnosis:** **verified** by a local-vs-production A/B and a
git audit of the shader (see Confirmed). The diagnosis is locked; the *fix* below is a
hypothesis to spike.

**Severity:** The GPURenderer's output is **wrong on every current three version** — this
regression has been shipping since `11.1.x` (the three r127→r185 upgrade). Treat the
GPURenderer as **unstable** until this lands.

**Upstream issue:** none yet — file one with this diagnosis.

---

## Summary

The `GPURenderer` draws particles with a **custom `ShaderMaterial`** whose fragment shader
writes colour straight to `gl_FragColor` with **no colour-space handling**. Under old three
(linear workflow, `ColorManagement` off) additive blending accumulated **in linear space**,
so overlapping additive particles summed and **saturated to a bright white-hot core**. Since
three **r152+** made **`outputColorSpace = SRGBColorSpace`** and `ColorManagement.enabled`
the defaults, the same unchanged shader now blends additively **in sRGB space**, so overlaps
no longer reach white — the render is visibly **dim and desaturated** exactly where particle
streams overlap.

Affects **`GPURenderer`** (Desktop + Mobile — both use the same raw-shader approach). The
`SpriteRenderer`/`MeshRenderer` path uses a three-managed `SpriteMaterial`/`Material` that
*does* participate in colour management, so it may be affected differently or not at all —
verify.

## Where this surfaced

Comparing the `gpu-renderer` example on a current build (`localhost`, three `0.185`) against
the deployed **three-nebula.org** (built against an old, pre-r152 three): individual particle
streams (yellow, cyan, magenta, purple) look identical in both, but the **bright white
additive core** where the streams overlap in production is **dim/absent** on the current
build. The difference is purely in additive *accumulation*, not in individual particles.

## Root cause

- `src/renderer/GPURenderer/Desktop/shaders/fragmentShader.ts` (and the Mobile equivalent)
  output `gl_FragColor = vec4(baseColor * targetColor, targetAlpha) * texture2D(uTexture, uv)`
  — raw colour, **no `#include <colorspace_fragment>`**, no linear↔sRGB conversion.
- Additive blending (`blendEquation: AddEquation`, `blendSrc: SrcAlpha`, `blendDst: One`)
  accumulates in whatever space the drawing buffer is in.
  - **Old three:** linear buffer → additive sums linearly → overlaps saturate to white.
  - **three r152+:** `outputColorSpace = SRGBColorSpace` by default → additive sums on
    sRGB-encoded values → highlights compress, overlaps stay dim.
- Neither the library nor a typical host sets `outputColorSpace`/`ColorManagement`, so simply
  upgrading three flips the behaviour underneath the unchanged shader.

## Confirmed (verified)

1. **The shader is byte-identical** to the version from *before* the r185 upgrade
   (`git log --follow` on `fragmentShader.ts`; last logic change predates the upgrade
   commit `454e516`). The code did not change — the environment did.
2. **No colour-management handling** exists anywhere in `src/renderer/**` (grep for
   `colorSpace|encoding|toneMapping|sRGB|ColorManagement` → nothing).
3. **The host does not compensate:** the website builds against `three@0.185.1` and creates
   `new THREE.WebGLRenderer({ canvas, ...options })` with no `outputColorSpace` override, so
   it inherits three's sRGB default.

**Decisive test to run (not yet done):** force `renderer.outputColorSpace =
THREE.LinearSRGBColorSpace` on the current build. Expectation: the bright white core returns,
proving colour management is the sole cause (and giving a candidate compatibility fix).

## Proposed approach (hypothesis — validate before committing)

Make the GPURenderer's additive output correct under modern three colour management. Additive
+ modern colour management is a genuinely fiddly interaction; candidate directions, in rough
order of preference, to be spiked against the A/B:

1. **Consistent texture + output colour space in the shader.** Mark the atlas texture's
   `colorSpace` appropriately and add output colour-space conversion so the custom shader
   participates in colour management like a built-in material. *Caveat:* additive blending
   after an sRGB output encode still accumulates in sRGB — this alone may not restore linear
   accumulation. Prototype and measure.
2. **Blend the particle pass in linear space.** Ensure additive accumulation happens before
   the sRGB encode (e.g. render particles into a linear target / keep the working space
   linear for the pass, converting once at the end). Most *correct*, larger change.
3. **Compatibility knob.** The library can't own the host's `outputColorSpace`, but it can
   expose/document the requirement, or set what it needs on its own material/target so the
   additive look matches the pre-r152 era regardless of the host default.

The exact fix is the deliverable of the spike; do not assume (1)–(3) without measuring
against the reference look.

### Mode nuance

Verify `SpriteRenderer` and `MeshRenderer` under the same colour management — their
three-managed materials likely behave differently from the raw GPU shader, so the fix may be
renderer-specific rather than global.

## Scope

- [ ] `GPURenderer` Desktop shader/material
- [ ] `GPURenderer` Mobile shader/material
- [ ] Texture atlas `colorSpace`
- [ ] Confirm/measure `SpriteRenderer` + `MeshRenderer` behaviour under r152+ colour management
- [ ] Decide library-level correctness vs a documented host requirement (and document it)

## Testing / regression

- **The current VR golden master is compromised for this:** the baselines were captured
  **at three r185** (`vr/baselines/`, commit `454e516`), so they **bake in the regression** —
  the fix will "fail" VR against the current baseline, which is *expected*. Part of this work
  is re-establishing a **correct** additive reference (matching the pre-r152 / production look)
  and re-baselining.
- **Add GPU coverage the suite currently lacks:** a **multi-overlap additive** fixture (the
  white-core case) and, ideally, a **multi-texture atlas** fixture — neither is in the golden
  master today, which is why this shipped undetected.
- A/B against the production (old-three) look as the target reference.

## Acceptance criteria

- Overlapping additive `GPURenderer` particles accumulate to a bright core matching the
  pre-r152 (production) look, under three r152+ (incl. r185).
- Individual particles and non-overlapping regions are unchanged.
- `SpriteRenderer`/`MeshRenderer` behaviour verified (fixed if also affected).
- Golden master re-baselined to the *correct* reference (not the regressed one) and green,
  with the new additive-overlap fixture added.

## References

- [three.js — Color management](https://threejs.org/docs/#manual/en/introduction/Color-management)
  (`ColorManagement`, `outputColorSpace`, the r152 default change).
- three r127→r185 upgrade: commit `454e516` (baselines captured here, encoding the regression).
- Shader: `src/renderer/GPURenderer/Desktop/shaders/fragmentShader.ts` (byte-identical since
  before the upgrade).
- Local (`three@0.185`) vs production (`three-nebula.org`, old three) `gpu-renderer` A/B — the
  investigation that isolated this.
