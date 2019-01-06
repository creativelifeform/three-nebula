import { Vector3D } from '../../../src/math';
import { easeInQuad } from '../../../src/ease';

export const preset = {
  easing: easeInQuad,
  life: 2,
  age: 4,
  energy: 4,
  dead: true,
  sleep: true,
  body: {},
  parent: {},
  mass: 7,
  radius: 22,
  alpha: 0.1,
  scale: 11,
  useColor: true,
  useAlpha: true,
  position: new Vector3D(1, 2, 2),
  velocity: new Vector3D(1, 2, 2),
  acceleration: new Vector3D(1, 2, 2),
  old: {
    position: new Vector3D(0, 3, 1),
    velocity: new Vector3D(5, 1, 5),
    acceleration: new Vector3D(0, 0, 1)
  },
  behaviours: ['a', 'b', 'c'],
  transform: {
    a: true
  },
  color: { r: 255, g: 234, b: 233 },
  rotation: new Vector3D(0, 0, 1)
};
