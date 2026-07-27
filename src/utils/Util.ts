import type Vector3D from '../math/Vector3D';

interface Vectorable {
  position: Vector3D;
  velocity: Vector3D;
  acceleration: Vector3D;
}

interface VectorConfig {
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  ax?: number;
  ay?: number;
  az?: number;
  p?: Vector3D;
  v?: Vector3D;
  a?: Vector3D;
  position?: Vector3D;
  velocity?: Vector3D;
  accelerate?: Vector3D;
}

export default {
  initValue: function<T>(value: T | null | undefined, defaults: T): T {
    const _value = value != null && value != undefined ? value : defaults;

    return _value;
  },

  isArray: function(value: unknown): value is unknown[] {
    return Object.prototype.toString.call(value) === '[object Array]';
  },

  destroyArray: function(array: unknown[]): void {
    array.length = 0;
  },

  destroyObject: function(obj: Record<string, unknown>): void {
    for (var o in obj) delete obj[o];
  },

  isUndefined: function(...args: unknown[]): boolean {
    for (var id in args) {
      var arg = args[id];

      if (arg !== undefined) return false;
    }

    return true;
  },

  setVectorByObj: function(target: Vectorable, pOBJ: VectorConfig): void {
    if (pOBJ.x !== undefined) target.position.x = pOBJ.x;
    if (pOBJ.y !== undefined) target.position.y = pOBJ.y;
    if (pOBJ.z !== undefined) target.position.z = pOBJ.z;

    if (pOBJ.vx !== undefined) target.velocity.x = pOBJ.vx;
    if (pOBJ.vy !== undefined) target.velocity.y = pOBJ.vy;
    if (pOBJ.vz !== undefined) target.velocity.z = pOBJ.vz;

    if (pOBJ.ax !== undefined) target.acceleration.x = pOBJ.ax;
    if (pOBJ.ay !== undefined) target.acceleration.y = pOBJ.ay;
    if (pOBJ.az !== undefined) target.acceleration.z = pOBJ.az;

    if (pOBJ.p !== undefined) target.position.copy(pOBJ.p);
    if (pOBJ.v !== undefined) target.velocity.copy(pOBJ.v);
    if (pOBJ.a !== undefined) target.acceleration.copy(pOBJ.a);

    if (pOBJ.position !== undefined) target.position.copy(pOBJ.position);
    if (pOBJ.velocity !== undefined) target.velocity.copy(pOBJ.velocity);
    if (pOBJ.accelerate !== undefined)
      target.acceleration.copy(pOBJ.accelerate);
  },

  //set prototype
  setPrototypeByObj: function<T extends Record<string, unknown>>(
    target: T,
    proObj: Record<string, unknown>,
    filters?: string[]
  ): T {
    for (var key in proObj) {
      // eslint-disable-next-line no-prototype-builtins
      if (target.hasOwnProperty(key)) {
        if (filters) {
          if (filters.indexOf(key) < 0)
            (target as Record<string, unknown>)[key] = this._getValue(
              proObj[key]
            );
        } else {
          (target as Record<string, unknown>)[key] = this._getValue(
            proObj[key]
          );
        }
      }
    }

    return target;
  },

  _getValue: function(pan: unknown): unknown {
    if (
      pan != null &&
      (pan as { constructor?: { type?: string } }).constructor?.type === 'Span'
    )
      return (pan as { getValue(): unknown }).getValue();
    else return pan;
  },
};
