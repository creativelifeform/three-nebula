import * as THREE from 'three';

// The soft additive glow sprite (dot.png) used across sandbox experiments,
// factored out of the ~identical inline createSprite/glow helpers. The texture is
// loaded once and shared across every glow() sprite (the per-particle material is
// cloned by the renderer anyway, so sharing the base texture is both correct and
// cheaper than re-loading it per emitter).
const dotTexture = new THREE.TextureLoader().load('/assets/dot.png');

export const glow = color =>
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: dotTexture,
      color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
