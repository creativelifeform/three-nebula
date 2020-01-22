const FLOAT_BYTE_SIZE = 4;
const POSITION_X_BYTE_SIZE = FLOAT_BYTE_SIZE;
const POSITION_Y_BYTE_SIZE = FLOAT_BYTE_SIZE;
const POSITION_Z_BYTE_SIZE = FLOAT_BYTE_SIZE;
const POSITION_BYTE_SIZE =
  POSITION_X_BYTE_SIZE + POSITION_Y_BYTE_SIZE + POSITION_Z_BYTE_SIZE;
const RGBA_BYTE_SIZE = FLOAT_BYTE_SIZE;
const PARTICLE_BYTE_SIZE = POSITION_BYTE_SIZE + RGBA_BYTE_SIZE;
const DEFAULT_MAX_PARTICLES = 10000;
const POSITION_BUFFER_STRIDE = 4;
const RGBA_BUFFER_STRIDE = 16;
const POSITION_BUFFER_ITEM_SIZE = 3; // x, y, z
const POSITION_BUFFER_OFFSET = 0;
const POSITION_BUFFER_IS_NORMALIZED = false;
const RGBA_BUFFER_ITEM_SIZE = 4; // r, g, b, a
const RGBA_BUFFER_OFFSET = POSITION_BYTE_SIZE;
const RGBA_BUFFER_IS_NORMALIZED = true;

/**
 * Creates and provides performant buffers for each mutable particle property and sets up
 *
 * @see https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_points_interleaved.html
 */
window.ParticleBufferGeometry = class extends THREE.BufferGeometry {
  constructor({ maxParticles = DEFAULT_MAX_PARTICLES }) {
    super();

    this.maxParticles = maxParticles;

    this.createBuffers().setAttributes();
  }

  /**
   * Creates the buffers that will be used to write data to the GPU.
   *
   * @return {ParticleBuffer}
   */
  createBuffers() {
    const arrayBuffer = new ArrayBuffer(this.maxParticles * PARTICLE_BYTE_SIZE);

    this.positionBuffer = new THREE.InterleavedBuffer(
      new Float32Array(arrayBuffer),
      POSITION_BUFFER_STRIDE
    );
    this.rgbaBuffer = new THREE.InterleavedBuffer(
      new Uint8Array(arrayBuffer),
      RGBA_BUFFER_STRIDE
    );

    return this;
  }

  /**
   * Sets up the buffer geometry that will be provided to the renderer's THREE.Points object.
   *
   * @return {ParticleBufferGeometry}
   */
  setAttributes() {
    this.setAttribute(
      'position',
      new THREE.InterleavedBufferAttribute(
        this.positionBuffer,
        POSITION_BUFFER_ITEM_SIZE,
        POSITION_BUFFER_OFFSET,
        POSITION_BUFFER_IS_NORMALIZED
      )
    );
    this.setAttribute(
      'color',
      new THREE.InterleavedBufferAttribute(
        this.rgbaBuffer,
        RGBA_BUFFER_ITEM_SIZE,
        RGBA_BUFFER_OFFSET,
        RGBA_BUFFER_IS_NORMALIZED
      )
    );

    return this;
  }

  /**
   * Gets the publicly accessible buffers.
   *
   * @return {object} buffers
   * @return {THREE.InterleavedBuffer} buffers.positionBuffer - The position buffer
   * @return {THREE.InterleavedBuffer} buffers.rgbaBuffer - The rgba buffer
   */
  get buffers() {
    const { positionBuffer, rgbaBuffer } = this;

    return {
      positionBuffer,
      rgbaBuffer,
    };
  }

  get positionBufferOffset() {
    return POSITION_BUFFER_OFFSET;
  }

  get rgbaBufferOffset() {
    return RGBA_BUFFER_OFFSET;
  }
};
