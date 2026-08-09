# Render-target additive compositing (transparent-canvas support)

**Status:** Specced, **not prioritised.** Opt-in future feature. The default and recommended
path for additive particles remains "render your background in the scene on an opaque canvas"
— see [#133](https://github.com/creativelifeform/three-nebula/issues/133).

**Depends on:** nothing hard. Cross-cuts both renderers.

---

## Motivation

three-nebula additive particles work correctly on an **opaque** canvas: the framebuffer has
real pixels, additive adds light onto them, overlaps saturate to white. They do **not** work on
a **transparent** (`alpha: true`) canvas over a DOM/CSS background, because additive blending
happens inside the WebGL framebuffer and the canvas→page step is an alpha **"over"** composite —
WebGL can never additively blend with the DOM (it can't read it). See #133 for the full
analysis.

The supported answers today are (1) use alpha-channel textures, or (2) put the background in the
scene. But some hosts genuinely need a **transparent canvas with additive particles** — e.g. an
app that wants real DOM/video *see-through* behind glowing particles. This spec describes the
principled way to support that: do the additive math in an offscreen opaque buffer, then
composite the result out with a derived alpha.

## Goal

An opt-in mode where additive (and subtractive) particles render **correctly on a transparent
canvas** — true additive accumulation (smooth, saturating), no opaque squares, no "over"
halos — using **any** texture (no alpha channel required), degrading to the current behaviour
when disabled.

## Approach

Classic glow/bloom compositing, applied to the particle pass:

1. **Render the particle pass into an opaque offscreen `WebGLRenderTarget`** cleared to opaque
   black. Additive/subtractive blending behaves correctly here (there's a real black backdrop
   to add onto), exactly like an opaque scene — smooth accumulation, saturates to white, no
   texture-alpha requirement.
2. **Composite that target onto the (transparent) main canvas** with a fullscreen pass whose
   output is `rgb = target.rgb`, `alpha = coverage(target.rgb)` where coverage is derived from
   luminance (e.g. `max(r,g,b)`, tuned). Bright glow → high alpha (visible over the page); black
   areas → `alpha ≈ 0` (page shows through). Because the additive accumulation already happened
   in the opaque buffer, the composite carries no overlap artifacts.

This is the *only* way to get true additive onto a transparent surface, and it's the same
technique the industry uses (render additive into an opaque target, then composite).

## Architecture & integration (the real cost)

Today three-nebula renderers are **passive**: they add objects to the host's `scene`, and the
host calls `renderer.render(scene, camera)`. This mode makes them **active** — they need their
own render pass and a compositing step, which changes the integration contract. Design
questions to resolve:

- **Isolating the particle pass.** The particle objects (SpriteRenderer's sprites, GPURenderer's
  `Points`) must be rendered *alone* into the offscreen target. Options: a dedicated `Layer` that
  the offscreen pass renders (and the main pass excludes), or a separate particle `Scene`. Layers
  are the lighter touch.
- **Driving the passes.** Someone has to: (a) render the host's opaque scene to the canvas, (b)
  render particles to the offscreen target, (c) composite. Options:
  - **Explicit host hook:** the host calls `nebula.render(renderer, camera)` (or a
    `CompositingRenderer`) instead of/after `renderer.render(...)`. Most transparent but changes
    the host API.
  - **`EffectComposer`/pass:** ship a three.js `Pass` the host adds to their composer. Familiar to
    three users, but assumes they use post-processing.
  - **Wrap the renderer:** three-nebula owns the whole render (opaque scene + particles +
    composite). Most "just works", most invasive.
- **Depth interaction.** Additive particles should still be occluded by opaque scene geometry
  (e.g. a model in front of them). The offscreen particle pass therefore needs the main scene's
  **depth buffer** (shared depth attachment, or a depth pre-pass copied in) so particles behind
  geometry are correctly hidden. Without this, particles render on top of everything. This is the
  trickiest part.
- **Resolution & resize.** The offscreen target tracks canvas size / DPR; handle resize.

## Coverage / alpha function

- Additive/subtractive → derive alpha from luminance of the composited buffer (`max` channel is a
  good default for saturated glows; tune to avoid over-darkening at the fringes).
- Blend-mode aware: only emissive modes go through this path; normal/alpha-blended particles
  composite conventionally and don't need it.
- Expose the curve (or at least a sensible default) so hosts can tune glow falloff.

## Scope

- [ ] Offscreen render target + compositing pass
- [ ] GPURenderer (Desktop + Mobile)
- [ ] SpriteRenderer / MeshRenderer (layer or particle-scene isolation)
- [ ] Depth sharing so opaque geometry occludes particles
- [ ] Integration surface (host hook vs `Pass` vs wrapper) — pick one, document it
- [ ] Enable/disable flag; default off (preserve current behaviour)
- [ ] Blend-mode-aware coverage; tunable falloff

## Performance

Adds one extra scene render (particles only) plus one fullscreen composite per frame, and an
offscreen target's worth of memory. Acceptable for the feature, but it's not free — keep it
opt-in.

## Testing

- Sandbox: a transparent-canvas experiment (DOM/CSS background visible) showing true additive
  with the opaque `circle_01.png` — no squares, no halos, smooth overlaps.
- Verify opaque scene geometry occludes particles correctly (depth).
- Verify normal/alpha-blended particles are unaffected.
- Confirm the opaque-canvas path is byte-unchanged when the mode is disabled (VR golden master
  stays green).
- Validate in a **real browser** (headless/swiftshader composites transparent canvases
  differently and is misleading — see #133).

## Acceptance criteria

- With the mode enabled on a transparent canvas: additive particles render as true additive over
  the DOM background — no opaque squares, no "over" halos, overlaps saturate to white — with a
  no-alpha texture.
- Opaque scene geometry occludes particles as expected.
- Mode disabled → current behaviour exactly (VR green).
- Documented integration path; clear guidance on when to use this vs the in-scene-background
  approach.

## Open questions

- Which integration surface (host hook / `EffectComposer` pass / renderer wrapper) best fits the
  library's passive-renderer contract?
- Depth sharing approach across the main and offscreen passes.
- Does the SpriteRenderer's per-particle material path complicate layer isolation?

## References

- [#133 resolution](https://github.com/creativelifeform/three-nebula/issues/133)
- Standard glow/bloom compositing (render emissive to a target, then composite).
- Sandbox: `additive-blending-scene-background-{cpu,gpu}` (the recommended, non-render-target
  approach).
