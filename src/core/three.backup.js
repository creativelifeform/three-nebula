const isBrowser = typeof window !== 'undefined' ? true : false;
const THREE = isBrowser && window.THREE ? window.THREE : require('three');

export const {
  BoxGeometry,
  Euler,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  OctahedronGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Texture,
  TextureLoader,
  Vector3,
  AdditiveBlending,
  CustomBlending,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending,
} = THREE;
