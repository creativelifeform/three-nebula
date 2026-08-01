# Fix #133 — additive/transparent particles render opaque squares on an `alpha: true` canvas

**Status:** Not started. **Blocked on:** the TypeScript migration landing on `develop`
(don't build this on the JS lib). Branch off `develop` *after* the migration merges, and
implement against the TS source.

**Root cause:** **verified** in a live engine host (see Reproduction → Confirmed). The
diagnosis is locked; the proposed *fix* below is still a hypothesis to spike.

**Upstream issue:** [#133 — "GPURenderer transparent vs non-transparent texture issue"](https://github.com/creativelifeform/three-nebula/issues/133)

---

## Summary

When three-nebula renders into a `THREE.WebGLRenderer` created with `{ alpha: true }`
(a transparent canvas), particles using **textures without an alpha channel** (opaque
black background — the standard additive-particle convention) render as **opaque black
squares** instead of compositing additively. Textures that carry a real alpha channel
render correctly. Affects both `GPURenderer` (where the issue was filed) and
`SpriteRenderer`.

## Where this surfaced

Building an in-place particle designer that hosts a live three-nebula `System` inside a
game engine's scene. The engine's `WebGLRenderer` is created with `alpha: true` because
its background is a **CSS gradient on the canvas element** (`canvas.style.background`),
so the WebGL canvas must be transparent for the gradient to show through. Every no-alpha
texture in the curated library (`circle_01.png` et al.) rendered as an opaque square;
the same systems render correctly in the standalone editor (whose renderer is not
`alpha: true`).

This is exactly the class of problem an in-place designer hits constantly: it must render
**arbitrary** user textures, many of which are additive-authored (no alpha). Baking alpha
into a curated set does not solve it for real usage — the library itself has to be correct
on a transparent canvas.

## Root cause

The **RGB blend is genuinely additive** — that part works. The defect is in the
**alpha channel** the fragment writes to the transparent canvas:

- A no-alpha texture samples as `alpha = 1` across the **entire quad**, including the
  black corners/background.
- The particle fragment therefore outputs `alpha = 1` where the texture is black
  (`rgb = 0`).
- With `alpha: true`, the browser composites the canvas over the page using
  **premultiplied alpha**. A pixel of `rgb = 0, alpha = 1` composites as **opaque black**
  — it cannot fall back to whatever is behind the canvas.

So the black corners of every sprite become opaque black squares. Textures with real
alpha escape this because their corners are `alpha = 0` → transparent. This is why the
symptom is alpha-channel-dependent even though the color blend mode is additive.

## Reproduction

1. `const renderer = new THREE.WebGLRenderer({ alpha: true })` over any non-black page
   background (e.g. a CSS gradient behind the canvas).
2. Emit particles using a texture with **no alpha channel** and an opaque (e.g. black)
   background, `blending: AdditiveBlending`.
3. Observe: each particle shows its full square texture background as opaque black,
   rather than compositing additively.
4. Swap in a texture **with** an alpha channel → renders correctly. (This A/B is the
   decisive diagnostic.)

### Confirmed (verified in-engine)

With the host `WebGLRenderer` at `alpha: true`, no-alpha additive textures render as opaque
black squares. Flipping the host to `alpha: false` with an opaque clear colour (flat white)
— changing **nothing else** — makes the squares **vanish entirely**; the same system
composites additively and cleanly, corners blending into the background. This isolates the
cause to the `alpha: true` premultiplied-canvas alpha compositing, exactly as this issue
describes, and confirms the RGB blend was additive all along (the defect is purely the
alpha channel written to the transparent canvas).

## Host-side mitigation (not a library fix)

A host can dodge this today by using an opaque canvas (`alpha: false`) and drawing its
background **in WebGL** (`scene.background` / a backdrop mesh) instead of on the canvas
element. That fixes that one host but leaves three-nebula incorrect for every `alpha: true`
consumer — which is exactly why the real fix belongs in the library.

## Why the known workarounds are insufficient

- **`.rgbr` fragment hack** (use the red channel as alpha, discussed in #133): fixes
  no-alpha textures but **breaks textures that have real authored alpha** — the shader
  can't distinguish "no alpha channel (defaulted to 1)" from "intentionally opaque".
- **`alpha: false` on the host renderer:** loses the transparent canvas — not an option
  when the app relies on canvas transparency (CSS-gradient backgrounds, DOM compositing).
- **Bake alpha into textures:** only helps a curated set; arbitrary user textures still
  break. Treats the symptom, not the library defect.

## Proposed approach (hypothesis — validate before committing)

The bug isn't really about the texture's alpha; it's that **additive particles should not
write into the destination (canvas) alpha channel at all.** Additive is emissive: it adds
light to whatever is behind, and should leave canvas alpha untouched so dark regions stay
transparent.

Use `blendFuncSeparate` / `blendEquationSeparate` so **color blends additively** while the
**alpha channel is left alone**:

- Color: `blendEquation: AddEquation`, `blendSrc: SrcAlphaFactor`, `blendDst: OneFactor`
  (unchanged additive).
- Alpha: `blendSrcAlpha: ZeroFactor`, `blendDstAlpha: OneFactor` (never overwrite dst
  alpha — particles don't corrupt the canvas's transparency).

Expected result on a transparent canvas: black corners keep `dstAlpha` (stay transparent →
show the page/gradient), additive glow adds color over whatever's behind, and it's
**texture-agnostic** (works with or without an alpha channel) and safe under both
`alpha: true` and `alpha: false`. This is a **blend-state** fix, not a shader rewrite,
which is why it can apply cleanly to both renderers.

### Mode nuance

This is correct for **additive** blending. For **normal** blending the authored alpha
*does* matter, so the alpha-blend override should be applied per blend mode (additive/
subtractive → leave dst alpha; normal/custom → conventional alpha handling). Design the
fix to be blend-mode-aware rather than global.

### Where it lands

- **GPURenderer:** the shared `ShaderMaterial` construction (currently takes a `blending`
  option) needs the separate alpha blend factors set alongside it, keyed off the blend
  mode.
- **SpriteRenderer:** per-particle `SpriteMaterial` — set `blendSrcAlpha`/`blendDstAlpha`/
  `blendEquationAlpha` (with `blending: CustomBlending` or the equivalent) on the body
  material so pooled clones inherit it. Confirm the material pool/clone path preserves the
  separate-alpha settings.

## Spike findings (SpriteRenderer path)

Spiked the separate-alpha approach on `BodySprite`'s `SpriteMaterial` (switch `AdditiveBlending`
→ `CustomBlending` with `blendSrcAlpha: Zero`, `blendDstAlpha: One`) and validated against the
sandbox `transparent-canvas-additive-blending` experiment.

**Confirmed:**
- **Direction is right.** The gradient shows through the corners again and the additive white
  core returns — a clear, large improvement over the opaque-squares baseline.
- **The pool/clone path preserves the fix** (the spec's open question). `MeshRenderer.onParticleCreated`
  clones the body material via `_materialPool.get(...)` when `useAlpha`/`useColor` are set, and
  `SpriteMaterial.clone()` copies all blend fields — so setting it on the body material is
  sufficient; per-particle clones inherit it.

**Not fully solved — the real crux:**
- **Residual hard-edged dark squares remain.** The blend-factor swap alone doesn't fully clean
  up, which points at **premultiplied-alpha compositing**: the host `WebGLRenderer` is
  `premultipliedAlpha: true` (three's default), and additive-glow-on-a-transparent-premultiplied
  canvas has subtleties a plain factor swap doesn't cover. The complete fix likely needs one of:
  output **premultiplied** color from the material/shader, or a documented/asserted host
  `premultipliedAlpha` expectation (a host concern the library can only partly own).
- `depthWrite: false` (standard for additive) did **not** resolve the squares on its own — it
  *revealed more* overlap, reinforcing that the residue is a compositing issue, not depth.

**Implication for the implementation:** it's more than a blend-state one-liner. Plan for a shared
`applyAdditiveAlphaBlend(material | shaderMaterialOpts)`-style helper used by `BodySprite`,
`Texture`, and the `GPURenderer` `ShaderMaterial`, blend-mode-aware (§ Mode nuance), with the
premultiplied-alpha behaviour nailed and validated on the full matrix below — and a VR
re-baseline, since the fix changes correct-case output on a transparent canvas.

## Scope

- [ ] `GPURenderer` (Desktop + Mobile variants)
- [ ] `SpriteRenderer` (and `MeshRenderer` base, if the material path is shared)
- [ ] Blend-mode-aware alpha handling (additive/subtractive vs normal/custom)
- [ ] Verify behaviour under both `alpha: true` and `alpha: false` host renderers

## Testing / regression

- **VR golden masters** (the existing three-nebula visual-regression suite) across the
  matrix: `{ alpha: true, alpha: false } × { additive, normal } × { GPURenderer,
  SpriteRenderer } × { no-alpha texture, alpha texture }`.
- Add a fixture that renders a **no-alpha additive texture on an `alpha: true` canvas over
  a non-black background** — the exact repro — so this can't regress silently.
- Confirm existing alpha-texture systems are byte-unchanged (the fix must not alter the
  correct cases).

## Acceptance criteria

- A no-alpha additive texture composites correctly (no opaque squares) on an `alpha: true`
  canvas over a non-black background, in **both** renderers.
- Alpha-channel textures are visually unchanged (no regression).
- Normal-blend systems are unchanged.
- Golden-master suite green across the test matrix above.

## References

- [three-nebula #133](https://github.com/creativelifeform/three-nebula/issues/133)
- [three.js forum — "Does Three.js support additive blending for opaque?"](https://discourse.threejs.org/t/does-three-js-support-additive-blending-for-opaque/36190)
  (additive works on opaque with `depthWrite: false`; confirms this isn't a "sprites can't
  additive" limitation)
- [three.js #1625 — black outline on sprites with transparent PNGs](https://github.com/mrdoob/three.js/issues/1625)
- Diagnostic that isolated it: `dot.png` (has alpha) renders correctly while `circle_01.png`
  (no alpha, opaque black bg) renders opaque squares, under an `alpha: true` engine
  renderer — proving alpha-channel dependence despite a measured `AdditiveBlending`
  material state.
