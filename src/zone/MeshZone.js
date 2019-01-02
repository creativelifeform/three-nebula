import { Geometry } from 'three';
import Zone from './Zone';
import { ZONE_TYPE_MESH as type } from './types';

/**
 * Uses a three Geometry to determine the zone parameters.
 *
 */
export default class MeshZone extends Zone {
  /**
   * @constructs {MeshZone}
   *
   * TODO BREAKING_CHANGE remove support for nested MeshZones and only accept
   * Geometry as the first argument
   *
   * @param {Geometry} geometry - the geometry that will determine the zone bounds
   * @param {number} scale - the zone scale
   * @return void
   */
  constructor(geometry, scale = 1) {
    super(type);

    if (geometry instanceof Geometry) {
      this.geometry = geometry;
    } else {
      this.geometry = geometry.geometry;
    }

    this.scale = scale;
    this.supportsCrossing = false;
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
