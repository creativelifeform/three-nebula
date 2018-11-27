import * as THREE from 'three';

import { DEFAULT_POSITION, DEFAULT_SIZE as size } from './constants';

export default {
  addEventListener: function(proton, onProtonUpdated) {
    proton.eventDispatcher.addEventListener('PROTON_UPDATE', onProtonUpdated);

    return this;
  },

  drawZone: function(proton, container, zone = {}) {
    const color = '#2194ce';
    const wireframe = true;
    const {
      width = size,
      height = size,
      depth = size,
      radius = size,
      x = DEFAULT_POSITION,
      y = DEFAULT_POSITION,
      z = DEFAULT_POSITION
    } = zone;
    let geometry;

    if (zone.isPointZone()) {
      geometry = new THREE.SphereGeometry(15);
    }

    if (zone.isLineZone()) {
      // TODO
    }

    if (zone.isBoxZone()) {
      geometry = new THREE.BoxGeometry(width, height, depth);
    }

    if (zone.isSphereZone()) {
      geometry = new THREE.SphereGeometry(radius, size, size);
    }

    if (zone.isMeshZone()) {
      geometry = zone.geometry.geometry
        ? zone.geometry.geometry.clone()
        : zone.geometry.clone();
    }

    if (!geometry) {
      geometry = new THREE.BoxGeometry(width, height, depth);
    }

    const material = new THREE.MeshBasicMaterial({ color, wireframe });
    // NOTE! geometry.clone is required for UNKNOWN reasons,
    // three does not render the mesh correctly without doing this since r88
    const mesh = new THREE.Mesh(geometry.clone(), material);

    container.add(mesh);

    this.addEventListener(proton, function() {
      mesh.position.set(x, y, z);
    });
  },

  drawEmitter: function(proton, container, emitter, color) {
    var geometry = new THREE.OctahedronGeometry(15);
    var material = new THREE.MeshBasicMaterial({
      color: color || '#aaa',
      wireframe: true
    });
    var mesh = new THREE.Mesh(geometry, material);

    container.add(mesh);

    this.addEventListener(proton, function() {
      mesh.position.copy(emitter.p);
      mesh.rotation.set(
        emitter.rotation.x,
        emitter.rotation.y,
        emitter.rotation.z
      );
    });
  },

  renderInfo: (function() {
    function getCreatedNumber(type, proton) {
      var pool = type == 'material' ? '_materialPool' : '_targetPool';
      var renderer = proton.renderers[0];

      return renderer[pool].cID;
    }

    function getEmitterPos(proton) {
      var e = proton.emitters[0];

      return (
        Math.round(e.p.x) + ',' + Math.round(e.p.y) + ',' + Math.round(e.p.z)
      );
    }

    return function(proton, style) {
      this.addInfo(style);
      var str = '';

      switch (this._infoType) {
        case 2:
          str += 'emitter:' + proton.emitters.length + '<br>';
          str += 'em speed:' + proton.emitters[0].cID + '<br>';
          str += 'pos:' + getEmitterPos(proton);
          break;

        case 3:
          str += proton.renderers[0].name + '<br>';
          str += 'target:' + getCreatedNumber('target') + '<br>';
          str += 'material:' + getCreatedNumber('material');
          break;

        default:
          str += 'particles:' + proton.getCount() + '<br>';
          str += 'pool:' + proton.pool.getCount() + '<br>';
          str += 'total:' + (proton.getCount() + proton.pool.getCount());
      }
      this._infoCon.innerHTML = str;
    };
  })(),

  addInfo: (function() {
    return function(style) {
      var self = this;

      if (!this._infoCon) {
        this._infoCon = document.createElement('div');
        this._infoCon.style.cssText = [
          'position:fixed;bottom:0px;left:0;cursor:pointer;',
          'opacity:0.9;z-index:10000;padding:10px;font-size:12px;',
          'width:120px;height:50px;background-color:#002;color:#0ff;'
        ].join('');

        this._infoType = 1;
        this._infoCon.addEventListener(
          'click',
          function() {
            self._infoType++;
            if (self._infoType > 3) self._infoType = 1;
          },
          false
        );

        var bg, color;

        switch (style) {
          case 2:
            bg = '#201';
            color = '#f08';
            break;

          case 3:
            bg = '#020';
            color = '#0f0';
            break;

          default:
            bg = '#002';
            color = '#0ff';
        }

        this._infoCon.style['background-color'] = bg;
        this._infoCon.style['color'] = color;
      }

      if (!this._infoCon.parentNode) document.body.appendChild(this._infoCon);
    };
  })()
};
