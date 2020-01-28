// Primitives
export const DEFAULT_MAX_PARTICLES = 10000;
export const VECTOR_3_SIZE = ['x', 'y', 'z'].length;
export const RGBA_SIZE = ['r', 'g', 'b', 'a'].length;
export const FLOAT_BYTE_SIZE = 4;

// Byte sizes
export const POSITION_BYTE_SIZE = VECTOR_3_SIZE * FLOAT_BYTE_SIZE;
export const SIZE_BYTE_SIZE = FLOAT_BYTE_SIZE;
export const RGBA_BYTE_SIZE = RGBA_SIZE * FLOAT_BYTE_SIZE;
export const ALL_BYTE_SIZES = [
  POSITION_BYTE_SIZE,
  SIZE_BYTE_SIZE,
  RGBA_BYTE_SIZE,
];
export const PARTICLE_BYTE_SIZE = ALL_BYTE_SIZES.reduce(
  (cur, acc) => cur + acc
);

// Attributes
export const POSITION_ATTRIBUTE_BUFFER_SIZE = VECTOR_3_SIZE;
export const SIZE_ATTRIBUTE_BUFFER_SIZE = 1;
export const RGBA_ATTRIBUTE_BUFFER_SIZE = RGBA_SIZE;
export const ALPHA_ATTRIBUTE_BUFFER_SIZE = 1;
export const ATTRIBUTE_TO_SIZE_MAP = {
  position: POSITION_ATTRIBUTE_BUFFER_SIZE,
  size: SIZE_ATTRIBUTE_BUFFER_SIZE,
  // THREE.Color does not contain alpha, so we will have separate attributes for these
  color: RGBA_ATTRIBUTE_BUFFER_SIZE,
  alpha: ALPHA_ATTRIBUTE_BUFFER_SIZE,
};
