import {
  ATTRIBUTE_TO_SIZE_MAP,
  DEFAULT_MAX_PARTICLES,
  PARTICLE_BYTE_SIZE,
} from './constants';
import type { BufferGeometry, InterleavedBuffer } from 'three';

let THREE: typeof import('three');

/**
 * Creates and provides performant buffers for mapping particle properties to geometry vertices.
 *
 * @author thrax <manthrax@gmail.com>
 * @author rohan-deshpande <rohan@creativelifeform.com>
 * @see https://threejs.org/examples/?q=buffe#webgl_buffergeometry_points_interleaved
 * @see https://threejs.org/examples/?q=points#webgl_custom_attributes_points
 */
export default class ParticleBuffer {
  maxParticles: number;
  interleavedBuffer: InterleavedBuffer;
  geometry: BufferGeometry;

  constructor(
    maxParticles: number = DEFAULT_MAX_PARTICLES,
    three: typeof import('three')
  ) {
    THREE = three;
    this.maxParticles = maxParticles;

    this.createInterleavedBuffer().createBufferGeometry();
  }

  /**
   * Creates the interleaved buffer that will be used to write data to the GPU.
   *
   * @return {ParticleBuffer}
   */
  createInterleavedBuffer(): ParticleBuffer {
    const arrayBuffer = new ArrayBuffer(this.maxParticles * PARTICLE_BYTE_SIZE);

    this.interleavedBuffer = new THREE.InterleavedBuffer(
      new Float32Array(arrayBuffer),
      PARTICLE_BYTE_SIZE
    );
    // this.interleavedBuffer.usage = THREE.DynamicDrawUsage;

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
  createBufferGeometry(): ParticleBuffer {
    this.geometry = new THREE.BufferGeometry();

    const { interleavedBuffer, geometry } = this;

    Object.keys(ATTRIBUTE_TO_SIZE_MAP).reduce((offset, attribute) => {
      const size = (ATTRIBUTE_TO_SIZE_MAP as Record<string, number>)[attribute];

      geometry.setAttribute(
        attribute,
        new THREE.InterleavedBufferAttribute(interleavedBuffer, size, offset)
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
  get buffer(): InterleavedBuffer {
    return this.interleavedBuffer;
  }

  get stride(): number {
    return PARTICLE_BYTE_SIZE;
  }
}
