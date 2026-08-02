# #133 — additive particles vs a transparent canvas: analysis & resolution

**Status:** Resolved — **not a library bug.** Close
[#133](https://github.com/creativelifeform/three-nebula/issues/133) after this branch merges.

**Outcome:** documented guidance (below) + sandbox experiments that demonstrate it. A future,
opt-in render-target mode is specced separately in
[`render-target-additive-compositing.md`](./render-target-additive-compositing.md) and is
**not prioritised**.

---

## Resolution (TL;DR)

This isn't a three-nebula bug — it's **two render surfaces that aren't designed to coexist**:
the **WebGL framebuffer** (where particles blend) and the **DOM/CSS page** behind a
*transparent* canvas (where a CSS background lives). Additive blending adds light to *the
framebuffer*; it fundamentally cannot add light to the DOM, because WebGL can't read the page.
So there are exactly two supported ways to get additive particles looking right:

1. **Particles over a *transparent* canvas → the textures need an alpha channel.** That alpha
   is the coverage the browser needs to composite the canvas over the page. A fully-opaque,
   no-alpha, black-background additive texture will paint **opaque squares**, because its
   corners are opaque. (The classic three.js sprite textures — `disc.png`, the snowflakes —
   all carry alpha, which is why additive "just works" with them.)
2. **A flat/gradient background behind additive particles → three must own it.** Render it in
   the scene (`scene.background`, or a backdrop mesh) on an **opaque** canvas — it cannot come
   from the DOM/CSS. With the background *in the framebuffer*, additive blends against real
   pixels and works with **any** texture, no alpha channel required.

## Root cause (verified)

A no-alpha texture samples `alpha = 1` across its **entire** quad, including the black
corners. On a transparent (`alpha: true`) canvas the browser composites the canvas over the
page using its alpha, so those opaque corners (`rgb = 0, alpha = 1`) become **opaque black
squares** and can't fall back to the page/gradient. Textures with a real alpha channel escape
this because their corners are `alpha = 0` → transparent. This is why the symptom is
alpha-channel-dependent even though the colour blend is genuinely additive.

## Why the blend-only fixes fail (investigation record)

Two library-side approaches were spiked and rejected — see git history on this branch:

- **Separate-alpha blend factors** (leave the destination alpha untouched): the glow then has
  nothing to composite against on the transparent areas, so **particles vanish** except where
  backed by opaque geometry.
- **Luminance-derived alpha in the shader**: the glow composites **"over"** the page (not
  additively), so overlapping particles show their disc boundaries and mid-tones **darken** the
  background (halos).

Root reason, confirmed in a real browser: **the canvas→page step is an alpha "over" composite,
never additive.** No shader or blend change can make WebGL add light to the DOM. (Note:
headless/swiftshader captures composite a transparent canvas differently and are misleading
here — validate in a real browser.)

## The fix that works: background in the scene

Rendering the gradient as `scene.background` on an opaque canvas gives **true additive** —
smooth accumulation, saturating to white where particles overlap, no squares, no artifacts —
with the **opaque, no-alpha texture** and a **completely clean library**. This mirrors how game
engines / effect tools (Effekseer, Unity, Unreal, PopcornFX) render additive: into an opaque
scene, where black self-masks and no alpha channel is required.

Demonstrated in the sandbox:

- `sandbox/experiments/additive-blending-scene-background-cpu` (SpriteRenderer)
- `sandbox/experiments/additive-blending-scene-background-gpu` (GPURenderer)

## The transparent-canvas case (future, opt-in)

If a genuine transparent canvas *with* additive particles is ever required (e.g. real DOM
see-through behind the particles), the principled solution is a **render-target compositing
pass**: render the additive particles into an opaque offscreen target (true additive), then
composite that target onto the transparent canvas with alpha derived from its luminance. That
is specced in [`render-target-additive-compositing.md`](./render-target-additive-compositing.md)
— a deliberate future feature, not a patch.

## References

- [three-nebula #133](https://github.com/creativelifeform/three-nebula/issues/133)
- Diagnostic: three.js sprite textures (`disc.png`, `snowflake*.png`) carry alpha; the #133
  texture (`circle_01.png`) is a fully-opaque palette PNG with no `tRNS` transparency.
- [three.js — Color management](https://threejs.org/docs/#manual/en/introduction/Color-management)
  (unrelated GPURenderer regression tracked separately).
