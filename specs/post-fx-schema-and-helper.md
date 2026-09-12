# Task Spec — Post-FX in the effect schema + an optional post-processing helper

**Type:** feature — serialization + optional companion. Follow-up.
**Status:** filed, not scheduled.
**Depends on:** nothing hard. Touches the JSON schema (`fromJSON`/`toJSON`) and
adds a new, optional entry point. Core render path is **not** touched.

---

## Problem

Bloom (and post-FX generally) makes additive particle effects far more
eye-catching — the sandbox proved it with an opt-in `?bloom` pass
(`EffectComposer` + `UnrealBloomPass`). The obvious next thought is "offer it in
the editor." But post-FX is **post-processing**: it takes over the render call
(`composer.render()` instead of `renderer.render(scene, camera)`) and operates on
the whole framebuffer. three-nebula deliberately does **not** own the render loop
or compositing — it adds objects to *your* scene and you render. So bloom does
not belong in the core render path or in any renderer. (See the reasoning that
led here: it's generic three.js, not particle-specific; it's WebGL-only while we
now ship WebGPU renderers; and "only particles glow" is selective bloom, a
scene-compositing concern.)

**But there is a real problem the engine must help with: WYSIWYG.** If the editor
offers a bloom toggle and the consuming app can't reproduce it, the editor breaks
its core promise — what you author is not what you ship. The discrepancy is **not**
caused by bloom being post-processing; it's caused by the **bloom config being
lost at the editor→runtime boundary.** That reframes the fix.

## Insight — separate the *definition* from the *application*

- **Definition** is data. three-nebula already owns effect serialization, so the
  post-FX config can travel *with* the effect. Owning the data does **not** mean
  owning the render loop.
- **Application** is a render-pipeline concern. Keep it out of core, but provide
  **one** optional helper that both the editor preview and the consuming app call
  with the *same* serialized params. One implementation ⇒ pixel-identical by
  construction ⇒ WYSIWYG closed.

## Proposed

### 1. `postFx` block in the effect schema (engine owns the data, not the render)

Add an optional `postFx` to the serialized system, carried through
`fromJSON`/`toJSON` and exposed on the `System` instance. The engine **stores and
round-trips it; it never applies it.**

```jsonc
{
  "postFx": {
    "bloom": {
      "strength": 1.2,
      "radius": 0.6,
      "threshold": 0.15
    }
  }
}
```

- Absent `postFx` = today's behaviour, unchanged. Additive, not a schema break
  (consistent with 01/05; fold the `04` version stamp in if convenient).
- Schema is open to further passes later (e.g. vignette, color grade) without a
  breaking change — `postFx` is a map keyed by pass name.

### 2. An optional `postfx` helper (application; both sides call it)

A small, tree-shakeable, **opt-in** entry point — NOT imported by core, NOT in
any renderer's render path. Something like:

```js
import { createPostFx } from 'three-nebula/postfx'; // WebGL first

const fx = createPostFx(renderer, scene, camera, system.postFx);
// per frame, instead of renderer.render(scene, camera):
fx.render();
fx.setSize(w, h);   // must be called on resize (bloom is screen-space)
fx.dispose();
```

- Wraps `EffectComposer` + a `RenderPass` + one pass per `postFx` entry
  (`bloom` → `UnrealBloomPass`) built from the serialized params.
- The **editor preview and the consuming app both use this exact helper** with the
  exact `system.postFx` → identical composite. This is the whole point.
- Lives behind a subpath export (like `three-nebula/webgpu`), so nobody who
  doesn't opt in pays for `three/addons` postprocessing.

### 3. Per-emitter variation — HDR emissive intensity, NOT per-emitter bloom

The obvious ask is "let each emitter have its own bloom amount." **Don't build
that as a per-emitter bloom control.** It is not how commercial designers do it,
and it drags us into a selective-bloom-per-emitter pipeline (multiple composers /
layers) for a result the industry gets far more simply.

**The commercial idiom is: one *global* bloom pass + per-emitter HDR emissive
intensity.** Bloom in the mainstream real-time tools is a single, screen-space,
HDR-threshold post effect; per-emitter *variation* is emergent from how bright
each emitter is authored, against that one shared threshold:

- **Unity (URP/HDRP, VFX Graph):** bloom is a global Volume override; you vary an
  emitter's glow via its **HDR color Intensity (EV)**. Brighter → crosses the
  global threshold harder → blooms more.
- **Unreal (Cascade/Niagara):** bloom is the global Post Process Volume; per-emitter
  variation is the particle material's **emissive intensity**.
- **PopcornFX / Effekseer:** engine/editor global bloom block + emissive/HDR per
  emitter.
- **Offline (Houdini + Nuke):** the only place *true* independent per-emitter bloom
  lives — via per-emitter **AOVs / render passes** composited separately. That is
  the "expose the render target" escape hatch (§4), not an emitter property.

So the feature to add is a **per-emitter/per-particle color intensity multiplier
(HDR, values > 1)** on the existing color path — authoring "brighter than white"
so an emitter deliberately crosses the shared bloom threshold. This:

- lives in the **serialized emitter definition**, so it's WYSIWYG-safe by the same
  mechanism as `postFx` (§1) — no separate machinery;
- is a *tiny* addition (a multiplier on the emissive/color output), not a
  post-processing pipeline;
- degrades gracefully — with bloom off it just reads as a brighter (clamped)
  particle; with bloom on it glows more.

Note three-nebula already gives per-emitter *apparent* glow the other cheap way
commercial tools use — **additive soft sprites** (the `dot.png` glow) — which needs
no post-processing at all. HDR intensity + one global bloom is the enhancement, not
a replacement.

**Requirement for HDR to actually register:** the WebGLRenderer must render to a
float/half-float target (or the bloom pass must read HDR luminance) — an LDR 8-bit
target clamps at white and defeats intensity > 1. The helper should set this up.

### 4. Selective bloom & the render-target escape hatch

If a project genuinely needs only-particles-glow or independent per-emitter bloom
*params* (beyond the §3 idiom), the answer is **not** to bake it into core:

- **Selective bloom** (particles bloom, scene geometry doesn't) is a standard
  three.js recipe — either layer masking + a dual composer, or (more correct)
  material-darkening non-bloom objects so occlusion is preserved (pure layer
  isolation makes bloom bleed *through* foreground geometry). The helper MAY offer
  a selective mode, but it is opt-in and secondary to §3.
- **Renderer integration is cheaper than it looks.** `GPURenderer` adds a **single**
  `THREE.Points` to its container (`GPURenderer/*/index.ts`), so selecting it for
  bloom is one object. `Sprite`/`Mesh` renderers pool per-particle objects under
  one container and add/remove them on birth/death (`MeshRenderer.ts`), but since
  three.js layers don't auto-inherit, the helper just does one
  `container.traverse(o => o.layers.enable(BLOOM_LAYER))` per frame — which
  auto-catches new spawns. No per-emit developer boilerplate.
- **Primary API is the raw render target, not a forced final composite.** The
  helper should expose the bloom **render target** so apps with existing
  post-processing hook it into their own master pipeline (the Houdini/AOV model);
  the one-call `render()` is a convenience for the simple case only. Core/helper
  never owns final compositing.

## Fidelity requirements (this is where WYSIWYG actually lives)

"Same pass + same params" is necessary but **not sufficient**. The helper must
pin the variables that make two composites diverge:

- **Resolution independence.** `UnrealBloomPass` is screen-space — radius/spread
  scale with canvas size, so identical params at the editor's resolution vs an
  app's smaller canvas won't match. Either normalize the bloom kernel to a
  reference resolution, or document the coupling and expose the reference size.
  **Requirement:** the same effect at two canvas sizes must look the same (within
  tolerance), or the divergence must be explicit and documented.
- **Color space / tone mapping.** If the app's `WebGLRenderer` uses different
  output color space or tone mapping than the editor, the composite diverges even
  with identical passes. The helper should read/pin these (or document the exact
  renderer settings the editor assumes).
- **Clear/alpha.** Bloom over a transparent canvas interacts with the same
  additive-on-transparent problem as `render-target-additive-compositing.md`;
  note the interaction, don't re-solve it here.

## Acceptance

- A system with a `postFx.bloom` block round-trips through `toJSON`/`fromJSON`
  unchanged; a system without `postFx` is byte-identical to today.
- `createPostFx(...).render()` produces the same look in two contexts (editor-like
  and app-like) given the same serialized `postFx` — verified at matched
  resolution + renderer settings.
- The same effect at two different canvas sizes matches within tolerance (or the
  resolution coupling is documented and the reference size is honored).
- Core bundle size and render path are unchanged for consumers who don't import
  `three-nebula/postfx`.
- The sandbox `?bloom` capability is re-expressed in terms of the helper (single
  implementation) rather than a bespoke composer in `Visualization`.
- **Per-emitter idiom (§3):** two emitters with different HDR color intensities,
  under one global bloom pass, bloom by visibly different amounts — with no
  per-emitter bloom config. Intensity round-trips in the emitter definition and,
  with bloom off, reads as a brighter (clamped) particle.
- **Escape hatch (§4):** the helper exposes the bloom render target; an app can
  composite it into its own pipeline without routing through the helper's
  `render()`. A selective-bloom mode, if implemented, leaves scene geometry
  un-bloomed while particles glow.

## Risk / notes

- **WebGL first; WebGPU is a follow-up.** three's postprocessing differs between
  `WebGLRenderer` (`EffectComposer`) and `WebGPURenderer` (node/TSL post). Scope
  this to WebGL; note the WebGPU path as a separate step so we don't strand the
  WebGPU renderers.
- Keep the boundary crisp: engine = schema/data, helper = application. If we ever
  feel tempted to have core call `composer.render()`, stop — that's the boundary
  we're protecting.
- This is the piece that makes an **editor** bloom toggle honest. The editor
  feature (UI, sliders) is still editor-side; this spec is only what the *engine*
  and its *optional helper* must provide so the editor's output is faithful.
