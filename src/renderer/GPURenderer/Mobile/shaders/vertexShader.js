import { SIZE_ATTENUATION_FACTOR } from '../../common/shaders/constants';

export const vertexShader = () => {
  return `
    uniform sampler2D uTexture;
    uniform vec2 atlasDim;

    attribute float size;
    attribute vec3 color;
    attribute float alpha;
    attribute vec2 texID;

    varying vec3 targetColor;
    varying float targetAlpha;
    varying vec4 tileRect;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      targetColor = color;
      targetAlpha = alpha;

      vec2 tmin = floor(texID) / atlasDim;
      vec2 tmax = fract(texID);
      tileRect = vec4(tmin,tmax);

      gl_PointSize = ((size * ${SIZE_ATTENUATION_FACTOR}) / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
`;
};
