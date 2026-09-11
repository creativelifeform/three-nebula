import BaseRenderer from './BaseRenderer';
import { RENDERER_TYPE_RIBBON as type } from './types';
import type Particle from '../core/Particle';
import type System from '../core/System';
import type {
  BufferGeometry,
  Camera,
  Mesh,
  Object3D,
  Texture,
  Vector3,
} from 'three';

type ThreeApi = typeof import('three');

type BlendingMode =
  | 'AdditiveBlending'
  | 'NormalBlending'
  | 'NoBlending'
  | 'SubtractiveBlending'
  | 'MultiplyBlending';

interface RibbonRendererOptions {
  // The camera the ribbons should face. Without it, ribbons orient against a
  // fixed world-up instead (fine for a mostly side-on view).
  camera?: Camera;
  // Full ribbon width in world units, multiplied per-spine-point by the
  // particle's scale so a Scale behaviour tapers the strip.
  width: number;
  blending: BlendingMode;
  // Optional strip texture. UVs run along the ribbon per `uv` mode.
  texture?: Texture;
  // 'stretch' maps U 0→1 across the whole ribbon; 'tile' repeats U per segment.
  uv: 'stretch' | 'tile';
  depthTest: boolean;
  depthWrite: boolean;
}

const DEFAULT_OPTIONS: RibbonRendererOptions = {
  width: 20,
  blending: 'AdditiveBlending',
  uv: 'stretch',
  depthTest: true,
  depthWrite: false,
};

// Spine order within one instance is spawn order — the strip runs oldest→newest.
export const bySpawnIndex = (a: Particle, b: Particle): number =>
  a.spawnIndex - b.spawnIndex;

/**
 * Triangle indices for a ribbon of `pointCount` spine points. Each point owns two
 * vertices (left = 2i, right = 2i+1); each segment is two triangles. Pure so it
 * can be unit tested without THREE.
 */
export const ribbonIndices = (pointCount: number): number[] => {
  const indices: number[] = [];

  for (let i = 0; i < pointCount - 1; i++) {
    const l0 = 2 * i;
    const r0 = 2 * i + 1;
    const l1 = 2 * i + 2;
    const r1 = 2 * i + 3;

    indices.push(l0, l1, r0, r0, l1, r1);
  }

  return indices;
};

interface Ribbon {
  mesh: Mesh;
  geometry: BufferGeometry;
  positions: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;
  capacity: number; // spine points the buffers can hold
}

/**
 * Renders each emitter instance's particles as a single continuous, camera-facing
 * strip — the particles are the spine, in spawn order (spec 01, Stage 4). One
 * strip per `emitterInstanceId`, so every child-emitter trail is its own ribbon.
 *
 * Rebuilt each `onSystemUpdate` from the live particles the renderer is tracking;
 * width tapers with particle scale, colour/alpha come from the particle. Handles
 * the degenerate cases: a group of fewer than two points is hidden, and
 * zero-length segments reuse the previous orientation rather than emit NaNs.
 */
export default class RibbonRenderer extends BaseRenderer {
  three: ThreeApi;
  container: Object3D;
  options: RibbonRendererOptions;
  // Live particles grouped by the instance that emitted them.
  _groups: Map<string, Particle[]>;
  _ribbons: Map<string, Ribbon>;
  // Reused scratch vectors so the per-frame rebuild allocates nothing.
  _camPos: Vector3;
  _prev: Vector3;
  _next: Vector3;
  _tangent: Vector3;
  _view: Vector3;
  _side: Vector3;
  _lastSide: Vector3;
  _up: Vector3;

  constructor(
    container: Object3D,
    THREE: ThreeApi,
    options: Partial<RibbonRendererOptions> = {}
  ) {
    super(type);

    this.three = THREE;
    this.container = container;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this._groups = new Map();
    this._ribbons = new Map();
    this._camPos = new THREE.Vector3();
    this._prev = new THREE.Vector3();
    this._next = new THREE.Vector3();
    this._tangent = new THREE.Vector3();
    this._view = new THREE.Vector3();
    this._side = new THREE.Vector3();
    this._lastSide = new THREE.Vector3(1, 0, 0);
    this._up = new THREE.Vector3(0, 1, 0);
  }

  // Group key: the emitting instance, falling back to the node id or a shared
  // bucket so the renderer also works on a plain (non-hierarchy) emitter.
  _keyOf(particle: Particle): string {
    return particle.emitterInstanceId || particle.emitterId || 'ribbon';
  }

  onParticleCreated(particle: Particle): void {
    const key = this._keyOf(particle);
    const group = this._groups.get(key);

    if (group) {
      group.push(particle);
    } else {
      this._groups.set(key, [particle]);
    }
  }

  onParticleUpdate(): void {
    // Positions are read from the live particles at rebuild time; nothing to do.
  }

  onParticleDead(particle: Particle): void {
    const key = this._keyOf(particle);
    const group = this._groups.get(key);

    if (!group) {
      return;
    }

    const index = group.indexOf(particle);

    if (index > -1) {
      group.splice(index, 1);
    }

    if (group.length === 0) {
      this._groups.delete(key);
      this._disposeRibbon(key);
    }
  }

  onSystemUpdate(): void {
    this._groups.forEach((group, key) => this._rebuild(key, group));
  }

  _rebuild(key: string, group: Particle[]): void {
    const ribbon = this._ensureRibbon(key, group.length);

    if (group.length < 2) {
      ribbon.mesh.visible = false;

      return;
    }

    ribbon.mesh.visible = true;
    group.sort(bySpawnIndex);

    const { width, uv, camera } = this.options;
    const n = group.length;
    const { positions, colors, uvs } = ribbon;

    if (camera) {
      camera.getWorldPosition(this._camPos);
    }

    for (let i = 0; i < n; i++) {
      const particle = group[i];
      const point = particle.position as unknown as Vector3;

      // Tangent by central difference (forward/backward at the ends).
      this._prev.copy(
        i > 0 ? (group[i - 1].position as unknown as Vector3) : point
      );
      this._next.copy(
        i < n - 1 ? (group[i + 1].position as unknown as Vector3) : point
      );
      this._tangent.subVectors(this._next, this._prev);

      // Side = tangent × view, camera-facing when a camera is set.
      if (camera) {
        this._view.subVectors(this._camPos, point).normalize();
      } else {
        this._view.copy(this._up);
      }

      this._side.crossVectors(this._tangent, this._view);

      if (this._side.lengthSq() < 1e-12) {
        // Coincident points or tangent parallel to view — keep the last good
        // orientation instead of emitting a zero-length (NaN-normal) segment.
        this._side.copy(this._lastSide);
      } else {
        this._side.normalize();

        // Keep the strip from flipping its edges (a bowtie/twist) where the
        // cross product changes sign as the spine curves relative to the camera:
        // align each side with the previous one. `_lastSide` is re-established at
        // point 0 of every rebuild, so continuity is per-spine, not cross-frame.
        if (i > 0 && this._side.dot(this._lastSide) < 0) {
          this._side.negate();
        }
      }

      this._lastSide.copy(this._side);

      const half = 0.5 * width * particle.scale;
      const lx = point.x + this._side.x * half;
      const ly = point.y + this._side.y * half;
      const lz = point.z + this._side.z * half;
      const rx = point.x - this._side.x * half;
      const ry = point.y - this._side.y * half;
      const rz = point.z - this._side.z * half;

      const vl = i * 6;

      positions[vl] = lx;
      positions[vl + 1] = ly;
      positions[vl + 2] = lz;
      positions[vl + 3] = rx;
      positions[vl + 4] = ry;
      positions[vl + 5] = rz;

      const { r, g, b } = particle.color;
      const a = particle.alpha;
      const cl = i * 8;

      colors[cl] = r;
      colors[cl + 1] = g;
      colors[cl + 2] = b;
      colors[cl + 3] = a;
      colors[cl + 4] = r;
      colors[cl + 5] = g;
      colors[cl + 6] = b;
      colors[cl + 7] = a;

      const u = uv === 'tile' ? i : i / (n - 1);
      const ul = i * 4;

      uvs[ul] = u;
      uvs[ul + 1] = 1;
      uvs[ul + 2] = u;
      uvs[ul + 3] = 0;
    }

    const { geometry } = ribbon;

    (geometry.attributes.position.array as Float32Array).set(
      positions.subarray(0, n * 6)
    );
    (geometry.attributes.color.array as Float32Array).set(
      colors.subarray(0, n * 8)
    );
    (geometry.attributes.uv.array as Float32Array).set(uvs.subarray(0, n * 4));

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.uv.needsUpdate = true;
    geometry.setDrawRange(0, (n - 1) * 6);
  }

  // Returns the ribbon for `key`, (re)allocating its buffers to hold at least
  // `points` spine points. Grows only — buffers are never shrunk.
  _ensureRibbon(key: string, points: number): Ribbon {
    const THREE = this.three;
    let ribbon = this._ribbons.get(key);
    const capacity = Math.max(points, 2);

    if (ribbon && ribbon.capacity >= capacity) {
      return ribbon;
    }

    // (Re)allocate buffers sized to the new capacity, preserving the mesh.
    const positions = new Float32Array(capacity * 6);
    const colors = new Float32Array(capacity * 8);
    const uvs = new Float32Array(capacity * 4);
    const indices = ribbonIndices(capacity);

    let geometry: BufferGeometry;
    let mesh: Mesh;

    if (ribbon) {
      geometry = ribbon.geometry;
      mesh = ribbon.mesh;
    } else {
      geometry = new THREE.BufferGeometry();
      const { blending, texture, depthTest, depthWrite } = this.options;
      const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE[blending],
        map: texture || null,
        depthTest,
        depthWrite,
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      this.container.add(mesh);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    ribbon = { mesh, geometry, positions, colors, uvs, capacity };
    this._ribbons.set(key, ribbon);

    return ribbon;
  }

  _disposeRibbon(key: string): void {
    const ribbon = this._ribbons.get(key);

    if (!ribbon) {
      return;
    }

    this.container.remove(ribbon.mesh);
    ribbon.geometry.dispose();
    (ribbon.mesh.material as { dispose: () => void }).dispose();
    this._ribbons.delete(key);
  }

  onSystemUpdateAfter?(): void {}

  remove(_system?: System): void {
    this._ribbons.forEach((_ribbon, key) => this._disposeRibbon(key));
    this._groups.clear();
  }

  destroy(): void {
    this.remove();
  }
}
