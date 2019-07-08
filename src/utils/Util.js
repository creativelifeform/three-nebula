export default {
  initValue: function(value, defaults) {
    var _value = value != null && value != undefined ? value : defaults;

    return _value;
  },

  isArray: function(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  },

  destroyArray: function(array) {
    array.length = 0;
  },

  destroyObject: function(obj) {
    for (var o in obj) delete obj[o];
  },

  isUndefined: function() {
    for (var id in arguments) {
      var arg = arguments[id];

      if (arg !== undefined) return false;
    }

    return true;
  },

  setVectorByObj: function(target, pOBJ) {
    if (pOBJ['x'] !== undefined) target.position.x = pOBJ['x'];
    if (pOBJ['y'] !== undefined) target.position.y = pOBJ['y'];
    if (pOBJ['z'] !== undefined) target.position.z = pOBJ['z'];

    if (pOBJ['vx'] !== undefined) target.velocity.x = pOBJ['vx'];
    if (pOBJ['vy'] !== undefined) target.velocity.y = pOBJ['vy'];
    if (pOBJ['vz'] !== undefined) target.velocity.z = pOBJ['vz'];

    if (pOBJ['ax'] !== undefined) target.acceleration.x = pOBJ['ax'];
    if (pOBJ['ay'] !== undefined) target.acceleration.y = pOBJ['ay'];
    if (pOBJ['az'] !== undefined) target.acceleration.z = pOBJ['az'];

    if (pOBJ['p'] !== undefined) target.position.copy(pOBJ['p']);
    if (pOBJ['v'] !== undefined) target.velocity.copy(pOBJ['v']);
    if (pOBJ['a'] !== undefined) target.acceleration.copy(pOBJ['a']);

    if (pOBJ['position'] !== undefined) target.position.copy(pOBJ['position']);
    if (pOBJ['velocity'] !== undefined) target.velocity.copy(pOBJ['velocity']);
    if (pOBJ['accelerate'] !== undefined)
      target.acceleration.copy(pOBJ['accelerate']);
  },

  //set prototype
  setPrototypeByObj: function(target, proObj, filters) {
    for (var key in proObj) {
      // eslint-disable-next-line no-prototype-builtins
      if (target.hasOwnProperty(key)) {
        if (filters) {
          if (filters.indexOf(key) < 0)
            target[key] = this._getValue(proObj[key]);
        } else {
          target[key] = this._getValue(proObj[key]);
        }
      }
    }

    return target;
  },

  _getValue: function(pan) {
    if (pan.constructor.type === 'Span') return pan.getValue();
    else return pan;
  },
};
