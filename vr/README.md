# Visual regression (VR) golden master

A deterministic screenshot harness for the sandbox example scenes. It renders
each example under controlled conditions (seeded RNG, fixed frame count), then
diffs the result pixel-for-pixel against a committed baseline in `baselines/`.

- `npm run vr` — render every example to `examples/` and check determinism.
- `npm run vr:baselines` — (re)write the golden master in `baselines/`.
- `npm run vr:diff` — diff the latest render against the baselines.

## Why it runs on SwiftShader (software WebGL)

The capture scripts launch headless Chromium with:

```
--use-gl=angle --use-angle=swiftshader
```

This forces WebGL onto **SwiftShader**, Google's CPU software rasteriser,
instead of the machine's GPU. That is deliberate: the golden master is diffed
near-pixel-exact, and **real GPUs do not produce identical pixels across
machines** (Apple/ANGLE-Metal vs Nvidia vs a Linux CI runner all differ
subtly). This is an OSS library — we can't pin the runner — so a
hardware-rendered baseline would flake everywhere. SwiftShader renders
**bit-identical** on any machine, which is what makes a committable baseline
viable.

## The blind spot — read this before trusting a green VR run

Determinism costs fidelity. **SwiftShader does not render the `GPURenderer`
faithfully** — its large `gl.POINTS` sprites come out as hard blocky squares
regardless of texture filtering or mipmaps, where a real GPU renders them as
smooth soft sprites. So:

- VR is **trustworthy for the CPU renderers** (`SpriteRenderer`,
  `MeshRenderer`) — opaque, deterministic, faithfully rendered in software.
- VR is **blind to `GPURenderer` visual correctness.** The GPU baselines
  already look broken (blocky) to the eye, yet are "green." A real-world GPU
  regression can pass VR, and a GPU fix will not show up in the diff.

A concrete case: the three r127→r185 upgrade regressed the `GPURenderer` texture
atlas (mipmaps stopped regenerating after the atlas canvas was resized, so
multi-texture systems aliased into blocky squares on real GPUs). VR did not
catch it — SwiftShader rendered the example blocky both before and after, so the
drift read as innocuous and the baseline was simply re-captured. See
`src/renderer/GPURenderer/common/TextureAtlas` and the fix's regression test at
`test/renderer/TextureAtlas.spec.js`.

## How to validate `GPURenderer` work instead

1. **Real browser, real GPU.** Run the sandbox (`npm run sandbox`) and look in an
   actual browser, or capture with **headed** Playwright (`headless: false`,
   *no* `--use-angle=swiftshader`) so ANGLE uses the real GPU. Headed captures
   are faithful; headless/SwiftShader ones are not.
2. **Unit tests** for the invariants that cause the visual bug — e.g.
   `TextureAtlas.spec.js` asserts the atlas texture is recreated with mipmaps
   enabled. These are environment-independent and belong in the normal suite.
