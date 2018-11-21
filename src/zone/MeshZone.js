import * as THREE from 'three';

(function(Proton, undefined) {
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

  function MeshZone(geometry, scale) {
    MeshZone._super_.call(this);
    if (geometry instanceof THREE.Geometry) {
      this.geometry = geometry;
    } else {
      this.geometry = geometry.geometry;
    }

    this.scale = scale || 1;
  }

  Proton.Util.inherits(MeshZone, Proton.Zone);
  MeshZone.prototype.getPosition = function() {
    var vertices = this.geometry.vertices;
    var rVector = vertices[(vertices.length * Math.random()) >> 0];
    this.vector.x = rVector.x * this.scale;
    this.vector.y = rVector.y * this.scale;
    this.vector.z = rVector.z * this.scale;
    return this.vector;
  };

  MeshZone.prototype.crossing = function(particle) {
    if (this.log) {
      console.error('Sorry MeshZone does not support crossing method');
      this.log = false;
    }
  };

  Proton.MeshZone = MeshZone;
})(Proton);
