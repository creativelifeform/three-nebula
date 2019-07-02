export const getSupportedMaterialBlendingModes = THREE => ({
  AdditiveBlending: THREE.AdditiveBlending,
  CustomBlending: THREE.CustomBlending,
  MultiplyBlending: THREE.MultiplyBlending,
  NoBlending: THREE.NoBlending,
  NormalBlending: THREE.NormalBlending,
  SubtractiveBlending: THREE.SubtractiveBlending,
});

export const getDefaultMaterialProperties = THREE => ({
  color: 0xff0000,
  blending: THREE.AdditiveBlending,
  fog: true,
});

export const getDefaultJsonMaterialProperties = THREE => ({
  ...getDefaultMaterialProperties(THREE),
  blending: 'AdditiveBlending',
});

export const DEFAULT_RATE_NUM_PAN = 1;
export const DEFAULT_RATE_TIME_PAN = 1;
