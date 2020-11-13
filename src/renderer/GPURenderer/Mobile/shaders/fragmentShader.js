export const fragmentShader = () => {
  return `
    uniform vec3 baseColor;
    uniform sampler2D uTexture;
    //uniform sampler2D atlasIndex;                                   //GPU

    varying vec3    targetColor;
    varying float   targetAlpha;
    varying vec4    tileRect;                                       //GPU
    //varying float   tileID;                                         //GPU

    void main() {
      gl_FragColor = vec4(baseColor * targetColor, targetAlpha);

      vec2 uv = gl_PointCoord;
      uv = mix(tileRect.xy, tileRect.zw, gl_PointCoord); //GPU

      gl_FragColor = gl_FragColor * texture2D(uTexture, uv);

    }
`;
};
