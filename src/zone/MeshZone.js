import * as THREE from 'three';

import Zone from './Zone';

export default class MeshZone extends Zone {
  /**
   * MeshZone is a threejs mesh zone
   * @param {Geometry|Mesh} geometry - a THREE.Geometry or THREE.Mesh object
   * @example
   * var geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
   * var cylinder = new THREE.Mesh( geometry, material );
   * var meshZone = new Proton.MeshZone(geometry);
   * or
   * var meshZone = new Proton.MeshZone(cylinder);
   * @extends {Proton.Zone}
   * @constructor
   */

  constructor(geometry, scale) {
    super();

    if (geometry instanceof THREE.Geometry) {
      this.geometry = geometry;
    } else {
      this.geometry = geometry.geometry;
    }

    this.scale = scale || 1;
    this.supportsCrossing = false;
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
