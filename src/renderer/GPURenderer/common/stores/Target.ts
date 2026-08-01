import type { Color, Texture, Vector3 } from 'three';

/**
 * Simple class that stores the particle's "target" or "next" state.
 *
 */
export class Target {
  position: Vector3;
  rotation: Vector3;
  size: number;
  color: Color;
  alpha: number;
  texture: Texture | null;
  index: number;
  textureIndex?: number;

  constructor(THREE: typeof import('three')) {
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Vector3();
    this.size = 0;
    this.color = new THREE.Color();
    this.alpha = 0;
    this.texture = null;
    this.index = 0;
  }

  reset(): void {
    this.position.set(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.size = 0;
    this.color.setRGB(0, 0, 0);
    this.alpha = 0;
    this.texture = null;
  }
}
