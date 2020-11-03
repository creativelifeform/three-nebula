export const fragmentShader = () => {
  return `
    uniform vec3 baseColor;
    uniform sampler2D uTexture;
    uniform sampler2D atlasIndex;//GPU

    varying vec3    targetColor;
    varying float   targetAlpha;
    varying vec4    tileRect;
    varying float   tileID;

    void main() {

      //gl_FragColor = vec4(baseColor * targetColor, targetAlpha);
      gl_FragColor = vec4(.2);

      vec2 uv = gl_PointCoord;
 
      vec4 tRect = tileRect;//vec4(1.,0.,0.,1.); //tileRect;
      
      uv = mix(tRect.xy,tRect.zw,gl_PointCoord);
            
      gl_FragColor = gl_FragColor * texture2D(uTexture, uv) ;

  //gl_FragColor = tileID > .5 ? vec4(1.,0.,0.,1.):vec4(0.,1.,1.,1.);
   //   gl_FragColor = tileRect;
    }
`;
};
