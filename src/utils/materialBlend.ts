import type { Material } from 'three';

/**
 * Additive and subtractive blending are *emissive*: they add or remove light
 * relative to whatever is behind the particle, and must NOT write into the
 * destination (canvas) alpha channel. Otherwise a texture without an alpha
 * channel samples `alpha = 1` across its whole quad, so its opaque corners
 * composite as solid squares on a transparent (`alpha: true`) canvas — issue
 * [#133](https://github.com/creativelifeform/three-nebula/issues/133).
 *
 * For those two preset modes this switches the material to `CustomBlending`,
 * replicating the preset's **colour** blend exactly (so the visual result is
 * unchanged on an opaque canvas) while overriding only the **alpha** blend to
 * leave the destination alpha untouched (`src*0 + dst*1 = dst`). Every other
 * mode (normal, multiply, custom, none) is left as-is — their alpha is
 * meaningful and must composite conventionally.
 *
 * No-op unless the material is currently `AdditiveBlending` or
 * `SubtractiveBlending`.
 *
 * @param material - the material to adjust in place
 * @param THREE - the three API (blending mode constants)
 */
export const applyEmissiveAlphaBlend = (
  material: Material,
  THREE: typeof import('three')
): void => {
  const {
    AdditiveBlending,
    SubtractiveBlending,
    CustomBlending,
    AddEquation,
    SrcAlphaFactor,
    OneFactor,
    ZeroFactor,
    OneMinusSrcColorFactor,
  } = THREE;

  switch (material.blending) {
    case AdditiveBlending:
      // dst.rgb = src.rgb * src.a + dst.rgb (three's additive colour blend)
      material.blendSrc = SrcAlphaFactor;
      material.blendDst = OneFactor;
      break;
    case SubtractiveBlending:
      // dst.rgb = dst.rgb * (1 - src.rgb) (three's subtractive colour blend)
      material.blendSrc = ZeroFactor;
      material.blendDst = OneMinusSrcColorFactor;
      break;
    default:
      return;
  }

  material.blending = CustomBlending;
  material.blendEquation = AddEquation;

  // The fix: never overwrite the destination (canvas) alpha, so emissive
  // particles can't turn a transparent canvas opaque.
  material.blendEquationAlpha = AddEquation;
  material.blendSrcAlpha = ZeroFactor;
  material.blendDstAlpha = OneFactor;
};
