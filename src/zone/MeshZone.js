import { THREE } from '../core';
import Zone from './Zone';
import { ZONE_TYPE_MESH as type } from './types';

/**
 * Uses a three THREE.Geometry to determine the zone parameters.
 *
 */
export default class MeshZone extends Zone {
  /**
   * @constructs {MeshZone}
   *
   * @param {THREE.Geometry|Mesh} bounds - the geometry or mesh that will determine the zone bounds
   * @param {number} scale - the zone scale
   * @return void
   */
  constructor(bounds, scale = 1) {
    super(type);

    this.geometry = null;
    this.scale = scale;
    this.supportsCrossing = false;

    if (bounds instanceof THREE.Geometry) {
      this.geometry = bounds;
    }

    if (bounds.geometry) {
      this.geometry = bounds.geometry;
    }

    if (!this.geometry) {
      throw new Error(
        'MeshZone unable to set geometry from the supplied bounds'
      );
    }
  }

  /**
   * Returns true to indicate this is a MeshZone.
   *
   * @return {boolean}
   */
  isMeshZone() {
    return true;
  }

  getPosition() {
    var vertices = this.geometry.vertices;
    var rVector = vertices[(vertices.length * Math.random()) >> 0];

    this.vector.x = rVector.x * this.scale;
    this.vector.y = rVector.y * this.scale;
    this.vector.z = rVector.z * this.scale;

    return this.vector;
  }
}
