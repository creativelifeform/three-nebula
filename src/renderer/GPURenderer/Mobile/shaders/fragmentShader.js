export const fragmentShader = () => {
  return `
    uniform vec3 baseColor;
    uniform sampler2D uTexture;

    varying float vRotation;
    varying vec3 targetColor;
    varying float targetAlpha;
    varying vec4 tileRect;

    void main() {
      gl_FragColor = vec4(baseColor * targetColor, targetAlpha);

      vec2 uv = gl_PointCoord;
      uv = mix(tileRect.xy, tileRect.zw, gl_PointCoord);

      float mid = 0.5;
      uv = vec2(
        cos(vRotation) * (uv.x - mid) - sin(vRotation) * (uv.y - mid) + mid,
        cos(vRotation) * (uv.y - mid) + sin(vRotation) * (uv.x - mid) + mid
      );
      
      gl_FragColor = gl_FragColor * texture2D(uTexture, uv);
    }
`;
};
