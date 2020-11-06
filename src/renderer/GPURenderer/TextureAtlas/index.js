
export default class TextureAtlas {
  constructor(renderer) {
    let THREE = renderer.three;
    this.entries = [];

    let data = this.indexData = new Float32Array(256 * 4)

    this.atlasIndex = new THREE.DataTexture(data, 256, 1, THREE.RGBAFormat, THREE.FloatType);

    let ctx = this.ctx = document.createElement('canvas').getContext('2d')
    let canv = ctx.canvas;
    canv.width = canv.height = 256;
    this.debug = () => {
      //DEBUG SHOW TEXTURE ATLAS
      ctx.fillStyle = 'purple'
      let halfmax = canv.width
      ctx.fillRect(0, 0, halfmax, halfmax);
      ctx.fillStyle = 'green'
      ctx.fillRect(0, halfmax, halfmax, halfmax);
      ctx.fillStyle = 'blue'
      ctx.fillRect(halfmax, 0, halfmax, halfmax);
      ctx.fillStyle = 'orange'
      ctx.fillRect(halfmax, halfmax, halfmax, halfmax);
      ctx.fillStyle = 'yellow'
      ctx.font = canv.width + "px Verdana";
      ctx.fillText("top row", 100, 500)
      ctx.fillStyle = 'pink'
      ctx.fillText("bottom row", 100, 1500)

      canv.style.position = "absolute"
      canv.style.width = canv.style.height = "300px"
      canv.style.left = canv.style.top = "0px"
      canv.style.zIndex = 100;
      document.body.appendChild(canv);
    }
    //this.debug();
    this.atlasTexture = new THREE.CanvasTexture(ctx.canvas);
    this.atlasTexture.flipY = false;
    renderer.material.uniforms.uTexture.value = this.atlasTexture;
    renderer.material.uniforms.atlasIndex.value = this.atlasIndex;
    renderer.material.uniformsNeedUpdate = true;
  }
  addTexture(tex) {
    console.log("Adding texture to atlas:", tex.uuid);
    tex.textureIndex = this.entries.length;
    this.entries.push({ texture: tex })
    this.needsUpdate = true;
  }
  update() {
    if (!this.needsUpdate) return
    //Only rebuild if all images are loaded..
    for (let i = 0; i < this.entries.length; i++)if (!this.entries[i].texture.image) return
    this.needsUpdate = false;
    for (let i = 0; i < this.entries.length; i++) {
      let e = this.entries[i]
      let tex = e.texture;
      e.w = tex.image.width;
      e.h = tex.image.height;
    }
    let stats = potpack(this.entries);
    console.log("Rebuilt atlas:", stats);
    let canv = this.ctx.canvas;
    if ((canv.width != stats.w) || (canv.height != stats.h)) {
      canv.width = stats.w;
      canv.height = stats.h;
    }
    for (let i = 0, ii = 0; i < this.entries.length; i++, ii += 4) {
      let e = this.entries[i];
      this.indexData[ii + 0] = e.x / canv.width;
      this.indexData[ii + 1] = e.y / canv.height;
      this.indexData[ii + 2] = (e.x + e.w) / canv.width;
      this.indexData[ii + 3] = (e.y + e.h) / canv.height;
      this.ctx.drawImage(e.texture.image, e.x, e.y, e.w, e.h)
    }
    this.atlasIndex.needsUpdate = true;
    this.atlasTexture.needsUpdate = true;
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
  const spaces = [{ x: 0, y: 0, w: startWidth, h: Infinity }];

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

