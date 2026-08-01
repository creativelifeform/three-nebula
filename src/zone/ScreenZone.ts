import THREEUtil from '../utils/THREEUtil';
import Vector3D from '../math/Vector3D';
import Zone from './Zone';
import type Particle from '../core/Particle';
import type { Camera, WebGLRenderer } from 'three';
import { ZONE_TYPE_SCREEN as type } from './types';

// Scratch vectors reused across calls (matches the original closures).
const _positionVec2 = new Vector3D();
const _crossVec2 = new Vector3D();

export default class ScreenZone extends Zone {
  camera: Camera;
  renderer: WebGLRenderer;
  dis: number;
  d1: boolean;
  d2: boolean;
  d3: boolean;
  d4: boolean;

  constructor(
    camera: Camera,
    renderer: WebGLRenderer,
    dis?: number,
    dir?: string
  ) {
    super(type);

    this.camera = camera;
    this.renderer = renderer;
    this.dis = dis || 20;
    dir = dir || '1234';

    this.d1 = dir.indexOf('1') >= 0;
    this.d2 = dir.indexOf('2') >= 0;
    this.d3 = dir.indexOf('3') >= 0;
    this.d4 = dir.indexOf('4') >= 0;
  }

  isScreenZone(): boolean {
    return true;
  }

  getPosition(): Vector3D {
    const canvas = this.renderer.domElement;

    _positionVec2.x = Math.random() * canvas.width;
    _positionVec2.y = Math.random() * canvas.height;
    this.vector.copy(THREEUtil.toSpacePos(_positionVec2, this.camera, canvas));

    return this.vector;
  }

  _dead(particle: Particle): void {
    const pos = THREEUtil.toScreenPos(
      particle.position,
      this.camera,
      this.renderer.domElement
    );
    const canvas = this.renderer.domElement;

    if (pos.y + particle.radius < -this.dis && this.d1) {
      particle.dead = true;
    } else if (pos.y - particle.radius > canvas.height + this.dis && this.d3) {
      particle.dead = true;
    }

    if (pos.x + particle.radius < -this.dis && this.d4) {
      particle.dead = true;
    } else if (pos.x - particle.radius > canvas.width + this.dis && this.d2) {
      particle.dead = true;
    }
  }

  _bound(particle: Particle): void {
    const pos = THREEUtil.toScreenPos(
      particle.position,
      this.camera,
      this.renderer.domElement
    );
    const canvas = this.renderer.domElement;

    if (pos.y + particle.radius < -this.dis) {
      particle.velocity.y *= -1;
    } else if (pos.y - particle.radius > canvas.height + this.dis) {
      particle.velocity.y *= -1;
    }

    if (pos.x + particle.radius < -this.dis) {
      particle.velocity.y *= -1;
    } else if (pos.x - particle.radius > canvas.width + this.dis) {
      particle.velocity.y *= -1;
    }
  }

  _cross(particle: Particle): void {
    const pos = THREEUtil.toScreenPos(
      particle.position,
      this.camera,
      this.renderer.domElement
    );
    const canvas = this.renderer.domElement;

    if (pos.y + particle.radius < -this.dis) {
      _crossVec2.x = pos.x;
      _crossVec2.y = canvas.height + this.dis + particle.radius;
      particle.position.y = THREEUtil.toSpacePos(
        _crossVec2,
        this.camera,
        canvas
      ).y;
    } else if (pos.y - particle.radius > canvas.height + this.dis) {
      _crossVec2.x = pos.x;
      _crossVec2.y = -this.dis - particle.radius;
      particle.position.y = THREEUtil.toSpacePos(
        _crossVec2,
        this.camera,
        canvas
      ).y;
    }

    if (pos.x + particle.radius < -this.dis) {
      _crossVec2.y = pos.y;
      _crossVec2.x = canvas.width + this.dis + particle.radius;
      particle.position.x = THREEUtil.toSpacePos(
        _crossVec2,
        this.camera,
        canvas
      ).x;
    } else if (pos.x - particle.radius > canvas.width + this.dis) {
      _crossVec2.y = pos.y;
      _crossVec2.x = -this.dis - particle.radius;
      particle.position.x = THREEUtil.toSpacePos(
        _crossVec2,
        this.camera,
        canvas
      ).x;
    }
  }
}
