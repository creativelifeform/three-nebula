import BoxZone from './BoxZone';
import LineZone from './LineZone';
import MeshZone from './MeshZone';
import PointZone from './PointZone';
import ScreenZone from './ScreenZone';
import SphereZone from './SphereZone';
import type { SupportedZoneType } from '../core/constants';
import type ZoneBase from './Zone';

// `never[]` constructor params let each concrete (specifically-typed) zone class
// satisfy the table shape.
type ZoneFactory = new (...args: never[]) => ZoneBase;

// Every zone the base `CrossZone.fromJSON` could construct by indexing the zone
// namespace directly (it was unguarded) — this includes ScreenZone, which is NOT
// a `System.fromJSON` zone type but was still reachable via CrossZone.
// `Position.fromJSON` separately guards against the SupportedZoneType subset.
//
// Typing the table as `Record<SupportedZoneType, …> & Record<string, …>` keeps a
// compile-time guarantee that every supported System.fromJSON zone type maps to
// a real class, while the string index still admits the extra namespace zones.
const ZONES: Record<SupportedZoneType, ZoneFactory> &
  Record<string, ZoneFactory> = {
  BoxZone,
  LineZone,
  MeshZone,
  PointZone,
  ScreenZone,
  SphereZone,
};

/**
 * Constructs a zone for a `System.fromJSON` / `CrossZone.fromJSON` zone type.
 * The zone type and params come from untyped JSON, so the lookup and params are
 * narrowed once here at the deserialisation boundary — identical to the base JS,
 * which indexed the zone namespace by a bare string and spread the raw values
 * into the constructor. An unsupported `zoneType` yields `undefined`, so
 * `new undefined(...)` throws exactly as the base JS did.
 */
export const createZone = (zoneType: string, params: unknown[]): ZoneBase => {
  const Zone = ZONES[zoneType] as new (...args: unknown[]) => ZoneBase;

  return new Zone(...params);
};
