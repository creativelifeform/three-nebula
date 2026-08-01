/**
 * Regression pins for the behavioural-parity decisions made during the
 * JavaScript -> TypeScript migration. These lock in the resolutions of the
 * three behaviour drifts the hardening review surfaced (PAR-1/2/3) and the
 * behaviour-preserving strictNullChecks guards, guarding against future
 * regressions on VR-blind edge paths the visual suite doesn't exercise.
 *
 * Pre-migration behaviour was verified by executing the pre-migration sources
 * directly against these same inputs.
 */
import { describe, it, expect } from 'vitest';

import Util from '../src/utils/Util';
import ColorUtil from '../src/utils/ColorUtil';
import MeshZone from '../src/zone/MeshZone';
import Position from '../src/initializer/Position';
import EventDispatcher from '../src/events/EventDispatcher';
import { getEasingByName, ease } from '../src/ease';

describe('migration parity: Util._getValue / setPrototypeByObj with nullish values', () => {
  // Pre-migration behaviour: nullish values throw TypeError (fail-fast) rather
  // than being silently passed through onto the target.
  it('_getValue(null) throws', () => {
    expect(() => Util._getValue(null)).toThrow(TypeError);
  });

  it('_getValue(undefined) throws', () => {
    expect(() => Util._getValue(undefined)).toThrow(TypeError);
  });

  it('setPrototypeByObj throws for null props and leaves target untouched', () => {
    const target = { life: 1 };

    expect(() => Util.setPrototypeByObj(target, { life: null })).toThrow(
      TypeError
    );
    expect(target.life).toBe(1);
  });

  it('non-null values still pass through unchanged', () => {
    expect(Util._getValue(5)).toBe(5);
    expect(Util._getValue('x')).toBe('x');
    const target = { life: 1 };
    Util.setPrototypeByObj(target, { life: 3 });
    expect(target.life).toBe(3);
  });
});

describe('migration parity: MeshZone with a BufferGeometry and no ThreeGeometry ctor', () => {
  const bufferBounds = () => ({
    type: 'Geometry',
    isBufferGeometry: true,
    vertices: undefined,
  });

  // Pre-migration behaviour: constructing from a BufferGeometry without the
  // ThreeGeometry converter throws AT CONSTRUCTION (fail-fast), not later
  // per-particle inside getPosition().
  it('construction throws', () => {
    expect(() => new MeshZone(bufferBounds())).toThrow(TypeError);
  });

  it('legacy Geometry bounds still work identically', () => {
    const legacy = {
      type: 'Geometry',
      vertices: [{ x: 1, y: 2, z: 3 }],
    };
    const zone = new MeshZone(legacy, 2);
    const v = zone.getPosition();

    expect(v.x).toBe(2);
    expect(v.y).toBe(4);
    expect(v.z).toBe(6);
  });

  it('empty bounds still throw the same error', () => {
    expect(() => new MeshZone({})).toThrow(
      'MeshZone unable to set geometry from the supplied bounds'
    );
  });
});

describe('migration parity: ColorUtil.getRGB with an unparseable color string', () => {
  // Intended hardening: an unparseable colour returns zeroed channels (renders
  // black) instead of the pre-migration `{}` (which propagated NaN downstream).
  it('returns zeroed channels (black) for an unparseable colour', () => {
    const rgb = ColorUtil.getRGB('not-a-color');

    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });

  it('valid inputs are unchanged', () => {
    expect(ColorUtil.getRGB(0xff8800)).toEqual({
      r: 1,
      g: 0.5333333333333333,
      b: 0,
    });
    expect(ColorUtil.getRGB('255, 0, 0')).toEqual({ r: 1, g: 0, b: 0 });
    expect(ColorUtil.getRGB('#00ff00')).toEqual({ r: 0, g: 1, b: 0 });
    expect(ColorUtil.getRGB({ r: 0.1, g: 0.2, b: 0.3 })).toEqual({
      r: 0.1,
      g: 0.2,
      b: 0.3,
    });
  });
});

describe('migration parity: behaviour-preserving strictNullChecks guards', () => {
  it('getEasingByName(undefined) still falls back to easeLinear', () => {
    expect(getEasingByName(undefined)).toBe(ease.easeLinear);
    expect(getEasingByName('nope')).toBe(ease.easeLinear);
    expect(getEasingByName('easeInQuad')).toBe(ease.easeInQuad);
  });

  it('Position.fromJSON without zoneType throws the same error as before', () => {
    expect(() => Position.fromJSON({})).toThrow(
      'The zone type undefined is invalid or not yet supported'
    );
  });

  it('dispatchEvent returns false with no listeners, true with a truthy handler', () => {
    const d = new EventDispatcher();

    expect(d.dispatchEvent('none')).toBe(false);
    d.addEventListener('e', () => 'truthy');
    expect(d.dispatchEvent('e')).toBe(true);
  });
});
