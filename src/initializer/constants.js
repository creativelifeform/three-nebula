import { AdditiveBlending } from 'three';

export const DEFAULT_MATERIAL_PROPERTIES = {
  color: 0xff0000,
  blending: AdditiveBlending,
  fog: true,
};
export const DEFAULT_JSON_MATERIAL_PROPERTIES = {
  ...DEFAULT_MATERIAL_PROPERTIES,
  blending: 'AdditiveBlending',
};
export const DEFAULT_RATE_NUM_PAN = 1;
export const DEFAULT_RATE_TIME_PAN = 1;
