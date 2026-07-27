import { Vector3 } from '../core/three';
import type { Camera } from 'three';

interface CanvasSize {
  width: number;
  height: number;
}

export default {
  toScreenPos: (function() {
    var vector = new Vector3();

    return function(pos: Vector3, camera: Camera, canvas: CanvasSize): Vector3 {
      vector.copy(pos);
      // map to normalized device coordinate (NDC) space
      vector.project(camera);
      // map to 2D screen space
      vector.x = Math.round(((vector.x + 1) * canvas.width) / 2);
      vector.y = Math.round(((-vector.y + 1) * canvas.height) / 2);
      vector.z = 0;

      return vector;
    };
  })(),

  toSpacePos: (function() {
    var vector = new Vector3(),
      dir = new Vector3(),
      distance;

    return function(pos: Vector3, camera: Camera, canvas: CanvasSize): Vector3 {
      vector.set(
        (pos.x / canvas.width) * 2 - 1,
        -(pos.y / canvas.height) * 2 + 1,
        0.5
      );
      vector.unproject(camera);

      dir.copy(vector.sub(camera.position).normalize());
      distance = -camera.position.z / dir.z;
      vector.copy(camera.position);
      vector.add(dir.multiplyScalar(distance));

      return vector;
    };
  })(),
};
