const SIZE_ATTENUATION_FACTOR = '600.0';

export const vertexShader = () => {
  return `
    attribute float size;
    attribute vec3 color;
    attribute float alpha;

    varying vec3 targetColor;
    varying float targetAlpha;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      targetColor = color;
      targetAlpha = alpha;

      gl_PointSize = size * (${SIZE_ATTENUATION_FACTOR} / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
`;
};
