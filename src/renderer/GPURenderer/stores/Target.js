import { Color, Vector3 } from 'three';

/**
 * Simple class that stores the particle's "target" or "next" state.
 *
 */
export class Target {
  constructor() {
    this.position = new Vector3();
    this.size = 0;
    this.color = new Color();
    this.alpha = 0;
    this.texture = null;
    this.index = 0;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.size = 0;
    this.color.setRGB(0, 0, 0);
    this.alpha = 0;
    this.texture = null;
  }
}
