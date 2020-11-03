import { Target, UniqueList } from './stores';
import { fragmentShader, vertexShader } from './shaders';
import BaseRenderer from '../BaseRenderer';
import { DEFAULT_RENDERER_OPTIONS } from './constants';
import ParticleBuffer from './ParticleBuffer';
import { Pool } from '../../core';
import { RENDERER_TYPE_GPU } from '../types';

let THREE;

/**
 * Performant particle renderer that uses THREE.Points to propagate particle (postiion, rgba etc.,) properties to
 * vertices in a ParticleBufferGeometry.
 *
 * NOTE! This is an experimental renderer and is currently not covered by tests, coverage will be added when the API
 * is more stable. Currently only compatible with sprite/texture based systems. Meshes are not yet supported.
 *
 * @author thrax <manthrax@gmail.com>
 * @author rohan-deshpande <rohan@creativelifeform.com>
 */
export default class GPURenderer extends BaseRenderer {
  constructor(container, three, options = DEFAULT_RENDERER_OPTIONS) {
    super(RENDERER_TYPE_GPU);

    THREE = three;
    const props = { ...DEFAULT_RENDERER_OPTIONS, ...options };
    const {
      camera,
      maxParticles,
      baseColor,
      blending,
      depthTest,
      depthWrite,
      transparent,
    } = props;
    const particleBuffer = new ParticleBuffer(maxParticles, THREE);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(baseColor) },
        uTexture: { value: null },
        atlasIndex: { value: null },
      },
      vertexShader: vertexShader(),//.split('\n').filter(e=>!e.endsWith("//GPU")).join('\n'),
      fragmentShader: fragmentShader(),//.split('\n').filter(e=>!e.endsWith("//GPU")).join('\n'),
      blending: THREE[blending],
      depthTest,
      depthWrite,
      transparent,
    });

    this.camera = camera;
    this.targetPool = new Pool();
    this.uniqueList = new UniqueList(maxParticles);
    this.particleBuffer = particleBuffer;
    this.buffer = particleBuffer.buffer;
    this.stride = particleBuffer.stride;
    this.geometry = particleBuffer.geometry;
    this.material = material;
    this.points = new THREE.Points(this.geometry, this.material);

    container.add(this.points);
  }

  /**
   * Pools the particle target if it does not exist.
   * Updates the target and maps particle properties to the point.
   *
   * @param {Particle}
   */
  onParticleCreated(particle) {
    if (!particle.target) {
      particle.target = this.targetPool.get(Target, THREE);
      this.uniqueList.add(particle.id);
    }

    this.updateTarget(particle).mapParticleTargetPropsToPoint(particle);
  }

  /**
   * Maps particle properties to the point if the particle has a target.
   *
   * @param {Particle}
   */
  onParticleUpdate(particle) {
    if (!particle.target) {
      return;
    }

    this.updateTarget(particle).mapParticleTargetPropsToPoint(particle);
  }

  /**
   * Resets and clears the particle target.
   *
   * @param {Particle}
   */
  onParticleDead(particle) {
    if (!particle.target) {
      return;
    }

    particle.target.reset();
    this.mapParticleTargetPropsToPoint(particle);

    particle.target = null;
  }

  /**
   * Maps all mutable properties from the particle to the target.
   *
   * @param {Particle}
   * @return {GPURenderer}
   */

  updateTarget(particle) {
    const { position, scale, radius, color, alpha, body, id } = particle;
    const { r, g, b } = color;

    particle.target.position.copy(position);
    particle.target.size = scale * radius;
    particle.target.color.setRGB(r, g, b);
    particle.target.alpha = alpha;
    particle.target.index = this.uniqueList.find(id);

    if (body && body instanceof THREE.Sprite) {
        let map = body.material.map;
      particle.target.texture = map;

      particle.target.textureIndex = GPURenderer.getTextureID(this,map);
    }

    return this;
  }

  /**
   * Entry point for mapping particle properties to buffer geometry points.
   *
   * @param {Particle} particle - The particle containing the properties to map
   * @return {GPURenderer}
   */
  mapParticleTargetPropsToPoint(particle) {
    this.updatePointPosition(particle)
      .updatePointSize(particle)
      .updatePointColor(particle)
      .updatePointAlpha(particle)
      .updatePointTextureIndex(particle)
      .ensurePointUpdatesAreRendered();

    return this;
  }

  /**
   * Updates the point's position according to the particle's target position.
   *
   * @param {Particle} particle - The particle containing the target position.
   * @return {GPURenderer}
   */
  updatePointPosition(particle) {
    const attribute = 'position';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.position.x;
    buffer.array[target.index * stride + offset + 1] = target.position.y;
    buffer.array[target.index * stride + offset + 2] = target.position.z;

    return this;
  }

  /**
   * Updates the point's size relative to the particle's target scale and radius.
   *
   * @param {Particle} particle - The particle containing the target scale.
   * @return {GPURenderer}
   */
  updatePointSize(particle) {
    const attribute = 'size';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.size;

    return this;
  }

  /**
   * Updates the point's color attribute according with the particle's target color.
   *
   * @param {Particle} particle - The particle containing the target color and alpha.
   * @return {GPURenderer}
   */
  updatePointColor(particle) {
    const attribute = 'color';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.color.r;
    buffer.array[target.index * stride + offset + 1] = target.color.g;
    buffer.array[target.index * stride + offset + 2] = target.color.b;

    return this;
  }

  /**
   * Updates the point alpha attribute with the particle's target alpha.
   *
   * @param {Particle} particle - The particle containing the target alpha.
   * @return {GPURenderer}
   */
  updatePointAlpha(particle) {
    const attribute = 'alpha';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.alpha;

    return this;
  }

  /**
   * Updates the point texture attribute with the particle's target texture.
   *
   * @param {Particle} particle - The particle containing the target texture.
   * @return {GPURenderer}
   */
  updatePointTextureIndex(particle) {
    const attribute = 'texID';
    const { geometry, stride, buffer } = this;
    const { target } = particle;
    const { offset } = geometry.attributes[attribute];

    buffer.array[target.index * stride + offset + 0] = target.textureIndex;

    return this;
  }

  /**
   * Ensures that all attribute updates are marked as needing updates from the WebGLRenderer.
   *
   * @return {GPURenderer}
   */
  ensurePointUpdatesAreRendered() {
    Object.keys(this.geometry.attributes).map(attribute => {
      this.geometry.attributes[attribute].data.needsUpdate = true;
    });

    return this;
  }
}




function potpack(boxes) {

    // calculate total box area and maximum box width
    let area = 0;
    let maxWidth = 0;

    for (const box of boxes) {
        area += box.w * box.h;
        maxWidth = Math.max(maxWidth, box.w);
    }

    // sort the boxes for insertion by height, descending
    boxes.sort((a, b) => b.h - a.h);

    // aim for a squarish resulting container,
    // slightly adjusted for sub-100% space utilization
    const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);

    // start with a single empty space, unbounded at the bottom
    const spaces = [{x: 0, y: 0, w: startWidth, h: Infinity}];

    let width = 0;
    let height = 0;

    for (const box of boxes) {
        // look through spaces backwards so that we check smaller spaces first
        for (let i = spaces.length - 1; i >= 0; i--) {
            const space = spaces[i];

            // look for empty spaces that can accommodate the current box
            if (box.w > space.w || box.h > space.h) continue;

            // found the space; add the box to its top-left corner
            // |-------|-------|
            // |  box  |       |
            // |_______|       |
            // |         space |
            // |_______________|
            box.x = space.x;
            box.y = space.y;

            height = Math.max(height, box.y + box.h);
            width = Math.max(width, box.x + box.w);

            if (box.w === space.w && box.h === space.h) {
                // space matches the box exactly; remove it
                const last = spaces.pop();
                if (i < spaces.length) spaces[i] = last;

            } else if (box.h === space.h) {
                // space matches the box height; update it accordingly
                // |-------|---------------|
                // |  box  | updated space |
                // |_______|_______________|
                space.x += box.w;
                space.w -= box.w;

            } else if (box.w === space.w) {
                // space matches the box width; update it accordingly
                // |---------------|
                // |      box      |
                // |_______________|
                // | updated space |
                // |_______________|
                space.y += box.h;
                space.h -= box.h;

            } else {
                // otherwise the box splits the space into two spaces
                // |-------|-----------|
                // |  box  | new space |
                // |_______|___________|
                // | updated space     |
                // |___________________|
                spaces.push({
                    x: space.x + box.w,
                    y: space.y,
                    w: space.w - box.w,
                    h: box.h
                });
                space.y += box.h;
                space.h -= box.h;
            }
            break;
        }
    }

    return {
        w: width, // container width
        h: height, // container height
        fill: (area / (width * height)) || 0 // space utilization
    };
}


let MAX_TEX = 2048;
class TextureAtlas
{
    constructor(renderer){
        this.entries = [];

        let data = this.indexData = new Float32Array(256*4)

        this.atlasIndex = new THREE.DataTexture( data, 256,1, THREE.RGBAFormat, THREE.FloatType);
 
        let ctx = this.ctx = document.createElement('canvas').getContext('2d')
        let canv = ctx.canvas;
        canv.width=canv.height=MAX_TEX;
/*  //DEBUG SHOW TEXTURE ATLAS
        ctx.fillStyle='purple'
        let halfmax = MAX_TEX/2
        ctx.fillRect(0,0,halfmax,halfmax);
        ctx.fillStyle='green'
        ctx.fillRect(0,halfmax,halfmax,halfmax);
        ctx.fillStyle='blue'
        ctx.fillRect(halfmax,0,halfmax,halfmax);
        ctx.fillStyle='orange'
        ctx.fillRect(halfmax,halfmax,halfmax,halfmax);
        ctx.fillStyle='yellow'
        ctx.font = "600px Verdana";
        ctx.fillText("TOPPY",100,500)
        ctx.fillStyle='pink'
        ctx.fillText("CHUNKY",100,1500)

        canv.style.position = "absolute"
        canv.style.width=canv.style.height="300px"
        canv.style.left = canv.style.top = "0px"
        canv.style.zIndex = 100;
        document.body.appendChild(canv);
*/
        this.atlasTexture = new THREE.CanvasTexture(ctx.canvas);
        this.atlasTexture.flipY = false;
        renderer.material.uniforms.uTexture.value=this.atlasTexture;
        renderer.material.uniforms.atlasIndex.value=this.atlasIndex;
        renderer.material.uniformsNeedUpdate = true;
    }
    addTexture(tex){
        console.log("Adding texture to atlas:",tex.uuid,tex.image.width,tex.image.height);
        tex.textureIndex = this.entries.length;
        this.entries.push({texture:tex,h:tex.image.height,w:tex.image.width})
                
        let stats = potpack(this.entries);
        for(let i=0,ii=0;i<this.entries.length;i++,ii+=4){
            let e= this.entries[i];
            this.indexData[ii+0]=e.x/MAX_TEX;
            this.indexData[ii+1]=e.y/MAX_TEX;
            this.indexData[ii+2]=(e.x+e.w)/MAX_TEX;
            this.indexData[ii+3]=(e.y+e.h)/MAX_TEX;
            this.ctx.drawImage(e.texture.image,e.x,e.y,e.w,e.h)
            this.atlasIndex.needsUpdate = true;
            this.atlasTexture.needsUpdate = true;
        }
        console.log("Rebuilt atlas:",stats);
    }
}

GPURenderer.getTextureID=(renderer,tex)=>{
    if(tex.textureIndex===undefined){
        let atlas = GPURenderer.textureAtlas;
        if(!atlas)
            atlas = GPURenderer.textureAtlas = new TextureAtlas(renderer);
        //Add to atlas here...
        atlas.addTexture(tex)
    }
    return tex.textureIndex;
}

