import RingZone from './RingZone';
import { ZONE_TYPE_DISC as type } from './types';

/**
 * A filled disc zone in the XZ plane (normal +Y) — a `RingZone` with inner radius
 * 0. For flat circular emission: ground pools, rune discs, splash rings.
 *
 * Planar/emission-first (inherits `supportsCrossing = false`). v1 axis-aligned +Y.
 */
export default class DiscZone extends RingZone {
  constructor(
    centerX: number = 0,
    centerY: number = 0,
    centerZ: number = 0,
    radius: number = 100
  ) {
    super(centerX, centerY, centerZ, 0, radius);

    this.type = type;
  }
}
