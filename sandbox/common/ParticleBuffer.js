/**
 * @author thrax / http://vectorslave.com/
 **/

class ParticleBuffer //extends THREE.Points
{
    constructor({
        maxParticles=100000,
        depthTest=true,
        depthWrite=false,
        alphaTest=0,
        transparent=true,
        texture,
        blending=THREE.AdditiveBlending,
        tileAtlas=0,
        rowCount=16,
        dontMask,
        extraData={},
        }={}) {
        var tex = typeof texture==='string' ? new THREE.TextureLoader().load(texture) : texture
        var glslFmtNum=(num)=>((''+num).indexOf('.')<0)?(''+num+'.'):''+num
        var tileAtlasFmt = tileAtlas?glslFmtNum(tileAtlas):0;
        var tileAtlasRowFmt = tileAtlas?glslFmtNum(rowCount?rowCount:texture.image.atlas.rowCount):0
        var vertexShader = `
precision lowp float;
uniform vec2 displaySize;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
attribute vec4 color;
attribute float rotation;
attribute float scale;
attribute float age;
${tileAtlas?`
    attribute float tile0;
    attribute float tile1blend;
    varying vec2 vto0;
    varying vec2 vto1;
    varying float vTileBlend;`
    :``}
varying vec4 vColor;
varying mat2 mRotation;
void main() {
    
    vColor = color;
    vec3 projMVP = (modelMatrix * vec4(position,1.0)).xyz;
    float cameraDist = length( projMVP - cameraPosition );
    gl_PointSize = displaySize.y * scale / cameraDist;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    mRotation[0] = vec2(cos(rotation),-sin(rotation));
    mRotation[1] = vec2(sin(rotation),cos(rotation));
    ${tileAtlas?`
        vTileBlend = fract(tile1blend);
        float tile1=tile1blend-vTileBlend;
        float rows=${tileAtlasRowFmt};
        float tsz=${tileAtlasFmt};
        vto0=vec2(mod(tile0,rows),floor(tile0/rows))*tsz;
        vto1=vec2(mod(tile1,rows),floor(tile1/rows))*tsz;
        `:``}
}
`
        var fragmentShader = `
precision lowp float;
uniform sampler2D map;
varying mat2 mRotation;
varying vec4 vColor;
${tileAtlas?`
    varying vec2 vto0;
    varying vec2 vto1;
    varying float vTileBlend;` : ``}
void main() {
    ${THREE.ShaderChunk.alphatest_fragment}
    ${tileAtlas?(dontMask?``:`if(length(gl_PointCoord.xy-.5)>.5) discard;`):``}
    vec2 uv = (mRotation * (gl_PointCoord.xy-.5))+.5;
    ${tileAtlas?`
        uv *= ${tileAtlasFmt};
        gl_FragColor = vColor*((texture2D(map,(uv+vto0))*(1.-vTileBlend))+(texture2D(map,(uv+vto1))*vTileBlend));` 
        :`gl_FragColor = vColor*texture2D(map,uv);`}
    float len = length(gl_PointCoord.xy-.5);if(len>.5) discard;gl_FragColor = vColor*(1.-(2.*len));
}
`
        var stride = 10;
        if(tileAtlas)
            stride+=2;
        for(var i in extraData){
            stride+=extraData[i]
        }
        var data = new Float32Array( maxParticles * stride );
        var interleavedBuffer = new THREE.InterleavedBuffer(data,stride);
        interleavedBuffer.setUsage(THREE.DynamicDrawUsage)

            this.maxParticles = maxParticles;

        function makeGeometry(){
            var bufferGeometry = new THREE.BufferGeometry();
            var itop=0;
            var layout=bufferGeometry.userData.layout = {}
            var addAttr=(a,c)=>{bufferGeometry.setAttribute(a,new THREE.InterleavedBufferAttribute(interleavedBuffer,c,itop));layout[a]=itop;itop+=c;}

            addAttr('position',3)
            addAttr('color',4);
            addAttr('rotation',1);
            addAttr('scale',1);
            addAttr('age',1);
            if(tileAtlas){
                addAttr('tile0',1);
                addAttr('tile1blend',1);
            }

            for(var i in extraData){
                addAttr(i,extraData[i]);
            }
            return bufferGeometry;
        }
        this.pointsGeometry = makeGeometry();
        this.ribbonGeometry = makeGeometry();
        this.getIndex();

        var material = this.pointsMaterial = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            blending,
            uniforms: {map:{value:tex},displaySize:{value:new THREE.Vector2(640,480)}},
            depthTest,
            depthWrite,
            alphaTest,
            transparent,
            side:THREE.DoubleSide,
 //wireframe:true,
        });

        this.points = new THREE.Points(this.pointsGeometry,material)

        this.ribbons = new THREE.Mesh(this.ribbonGeometry,material)

        //super(bufferGeometry,material);
        this.data = data;
        this.stride = stride;
        this.interleavedBuffer = interleavedBuffer
        this.tileAtlas = tileAtlas;
        this.rowCount = rowCount;
//        this.layout = layout;
        this.pointsGeometry.setDrawRange(0,0);
    }
    get max(){
        return this.data.length/this.stride
    }
    setSize(w,h){
        this.pointsMaterial.uniforms.displaySize.value.set(w,h)
    }
    set blending(v){
        var blend={'add':THREE.AdditiveBlending,'sub':THREE.SubtractiveBlending,'normal':THREE.NormalBlending,'multiply':THREE.NormalBlending}[v]
        if(!blend)alert(`Blend mode:${v} not recognized. Please use add,sub,normal, or multiply.`)
        else this.pointsMaterial.blending = blend
    }
    /*
    get geometry(){
        return this.geometry
    }
    set geometry(g){
        return this.geometry = g      
    }
    */
    reset(){
        this._indexBuffer=undefined;
        this.blending = 'add'
        this.pointsGeometry.setDrawRange(0,0);
        this.ribbonGeometry.setDrawRange(0,0);
    }
}
