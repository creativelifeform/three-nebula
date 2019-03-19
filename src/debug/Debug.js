import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  SphereGeometry,
} from 'three';
import { DEFAULT_POSITION, DEFAULT_SIZE as size } from './constants';

/**
 * @exports Debug - methods and helpers for debugging Proton emitters, zones and particles.
 */
export default {
  /**
   * Adds an event listener to the proton instance's PROTON_UPDATE event.
   *
   * @param {Proton} proton - the proton instance
   * @param {function} onProtonUpdated - the function to call when proton has been updated
   * @return {Debug}
   */
  addEventListener: function(proton, onProtonUpdated) {
    proton.eventDispatcher.addEventListener('PROTON_UPDATE', onProtonUpdated);

    return this;
  },

  /**
   * Draws a wireframe mesh around the zone for debugging purposes.
   *
   * @param {Proton} proton - the proton instance
   * @param {object} container - a three Object3D (usually the scene)
   * @param {Zone} zone - a Zone instance
   * @return void
   */
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
      z = DEFAULT_POSITION,
    } = zone;
    let geometry;

    if (zone.isPointZone()) {
      geometry = new SphereGeometry(15);
    }

    if (zone.isLineZone()) {
      // TODO
    }

    if (zone.isBoxZone()) {
      geometry = new BoxGeometry(width, height, depth);
    }

    if (zone.isSphereZone()) {
      geometry = new SphereGeometry(radius, size, size);
    }

    if (zone.isMeshZone()) {
      geometry = zone.geometry.geometry
        ? zone.geometry.geometry.clone()
        : zone.geometry.clone();
    }

    if (!geometry) {
      geometry = new BoxGeometry(width, height, depth);
    }

    const material = new MeshBasicMaterial({ color, wireframe });
    // NOTE! geometry.clone is required for UNKNOWN reasons,
    // three does not render the mesh correctly without doing this since r88
    const mesh = new Mesh(geometry.clone(), material);

    container.add(mesh);

    this.addEventListener(proton, function() {
      mesh.position.set(x, y, z);
    });
  },

  /**
   * Draws a mesh for each particle emitted in order to help debug particles.
   *
   * @param {object} proton - the proton instance
   * @param {object} container - a three Object3D (usually the scene)
   * @param {object} emitter - the emitter to debug
   * @param {string} color - the color for the debug mesh material
   * @return void
   */
  drawEmitter: function(proton, container, emitter, color) {
    const geometry = new OctahedronGeometry(size);
    const material = new MeshBasicMaterial({
      color: color || '#aaa',
      wireframe: true,
    });
    // NOTE! geometry.clone is required for UNKNOWN reasons,
    // three does not render the mesh correctly without doing this since r88
    const mesh = new Mesh(geometry.clone(), material);

    container.add(mesh);

    this.addEventListener(proton, function() {
      mesh.position.copy(emitter.position);
      mesh.rotation.set(
        emitter.rotation.x,
        emitter.rotation.y,
        emitter.rotation.z
      );
    });
  },

  /**
   * Renders emitter / particle information into the info element.
   *
   * @param {object} proton - the proton instance
   * @param {integer} style - style to apply (see the addInfo method's switch statement)
   * @return void
   */
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

  /**
   * Appends the info element into the dom.
   *
   * @param {integer} style - the style type to apply
   * @return void
   */
  addInfo: (function() {
    return function(style) {
      var self = this;

      if (!this._infoCon) {
        this._infoCon = document.createElement('div');
        this._infoCon.style.cssText = [
          'position:fixed;bottom:0px;left:0;cursor:pointer;',
          'opacity:0.9;z-index:10000;padding:10px;font-size:12px;',
          'width:120px;height:50px;background-color:#002;color:#0ff;',
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
  })(),
};
