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
