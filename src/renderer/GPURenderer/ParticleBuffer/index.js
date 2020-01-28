import { ATTRIBUTE_TO_SIZE_MAP, PARTICLE_BYTE_SIZE } from './constants';

/**
 * Creates and provides performant buffers for mapping particle properties to geometry vertices.
 *
 * @author thrax <manthrax@gmail.com>
 * @author rohan-deshpande <rohan@creativelifeform.com>
 * @see https://threejs.org/examples/?q=buffe#webgl_buffergeometry_points_interleaved
 * @see https://threejs.org/examples/?q=points#webgl_custom_attributes_points
 */
export default class ParticleBuffer {
  constructor(maxParticles, THREE) {
    this.maxParticles = maxParticles;
    this.THREE = THREE;
    this.geometry = new THREE.BufferGeometry();

    this.createInterleavedBuffer().setBufferGeometryAttributes();
  }

  /**
   * Creates the interleaved buffer that will be used to write data to the GPU.
   *
   * @return {ParticleBuffer}
   */
  createInterleavedBuffer() {
    const arrayBuffer = new ArrayBuffer(this.maxParticles * PARTICLE_BYTE_SIZE);

    this.interleavedBuffer = new this.THREE.InterleavedBuffer(
      new Float32Array(arrayBuffer),
      PARTICLE_BYTE_SIZE
    );

    return this;
  }

  /**
   * Sets the geometry's buffer attributes.
   *
   * NOTE Each attribute needs to be set at the right index in the buffer right after the previous
   * attribute that occupies a set amount of size in the buffer.
   *
   * @return {ParticleBufferGeometry}
   */
  setBufferGeometryAttributes() {
    const { interleavedBuffer, geometry } = this;

    Object.keys(ATTRIBUTE_TO_SIZE_MAP).reduce((offset, attribute) => {
      const size = ATTRIBUTE_TO_SIZE_MAP[attribute];

      geometry.setAttribute(
        attribute,
        new this.THREE.InterleavedBufferAttribute(
          interleavedBuffer,
          size,
          offset
        )
      );

      return (offset += size);
    }, 0);

    return this;
  }

  /**
   * Gets the publicly accessible interleaved buffer.
   *
   * @return {THREE.InterleavedBuffer} buffers - The interleaved buffer
   */
  get buffer() {
    return this.interleavedBuffer;
  }

  get stride() {
    return PARTICLE_BYTE_SIZE;
  }
}
