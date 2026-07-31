import Zone from './Zone';
import type Vector3D from '../math/Vector3D';
import { ZONE_TYPE_MESH as type } from './types';

// three removed the legacy `Geometry` (with `.vertices`) in r125+. These minimal
// shapes describe the removed-API surface MeshZone still relies on; @types/three
// no longer provides them.
interface LegacyGeometry {
  type?: string;
  vertices: Array<{ x: number; y: number; z: number }>;
  isBufferGeometry?: boolean;
  fromBufferGeometry?(geometry: LegacyGeometry): LegacyGeometry;
}

interface MeshBounds {
  type?: string;
  geometry?: LegacyGeometry;
}

type LegacyGeometryConstructor = new () => LegacyGeometry;

/**
 * Uses a three legacy Geometry to determine the zone parameters.
 */
export default class MeshZone extends Zone {
  geometry: LegacyGeometry | null;
  scale: number;

  constructor(
    bounds: MeshBounds | LegacyGeometry,
    scale: number = 1,
    ThreeGeometry?: LegacyGeometryConstructor
  ) {
    super(type);

    this.geometry = null;
    this.scale = scale;
    this.supportsCrossing = false;

    if (bounds.type && bounds.type === 'Geometry') {
      this.geometry = bounds as LegacyGeometry;
    }

    if ((bounds as MeshBounds).geometry) {
      this.geometry = (bounds as MeshBounds).geometry as LegacyGeometry;
    }

    if (!this.geometry) {
      throw new Error(
        'MeshZone unable to set geometry from the supplied bounds'
      );
    }

    if (this.geometry.isBufferGeometry) {
      // ThreeGeometry is required to convert BufferGeometry bounds; faithful to
      // the pre-migration construction-time TypeError when it isn't supplied
      // (rather than deferring the failure to a per-particle getPosition crash).
      this.geometry = new ThreeGeometry!().fromBufferGeometry!(this.geometry);
    }
  }

  isMeshZone(): boolean {
    return true;
  }

  getPosition(): Vector3D {
    const vertices = (this.geometry as LegacyGeometry).vertices;
    const rVector = vertices[(vertices.length * Math.random()) >> 0];

    this.vector.x = rVector.x * this.scale;
    this.vector.y = rVector.y * this.scale;
    this.vector.z = rVector.z * this.scale;

    return this.vector;
  }
}
