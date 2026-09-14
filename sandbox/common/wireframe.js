import * as THREE from 'three';

// Dim wireframe outlines of the emission zones, so an experiment can show the
// shape the particles are being emitted within. Geometry matches the zone maths
// in src/zone: ring/disc are in the XZ plane (normal +Y); cylinder is centred on
// the origin along +Y; cone has its apex at the group origin, opening up +Y.

const DIM = 0x5566aa;

const lineMaterial = (color = DIM) =>
  new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });

// A horizontal circle (XZ plane) at height y.
export const circle = (radius, { y = 0, color = DIM, segments = 96 } = {}) => {
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;

    points.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
  }

  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    lineMaterial(color)
  );
};

// A ring / annulus — inner + outer circles.
export const ring = (inner, outer, opts = {}) => {
  const group = new THREE.Group();

  group.add(circle(inner, opts));
  group.add(circle(outer, opts));

  return group;
};

// A cylinder centred on the origin along +Y: top + bottom circles + verticals.
export const cylinder = (radius, height, { color = DIM, spokes = 16 } = {}) => {
  const group = new THREE.Group();
  const half = height / 2;

  group.add(circle(radius, { y: half, color }));
  group.add(circle(radius, { y: -half, color }));

  const points = [];

  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;

    points.push(new THREE.Vector3(x, -half, z), new THREE.Vector3(x, half, z));
  }

  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(points),
      lineMaterial(color)
    )
  );

  return group;
};

// A cone with its apex at the group origin, opening up +Y to `radius` at `height`.
export const cone = (radius, height, { color = DIM, spokes = 16 } = {}) => {
  const group = new THREE.Group();

  group.add(circle(radius, { y: height, color }));

  const points = [];

  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;

    points.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(a) * radius, height, Math.sin(a) * radius)
    );
  }

  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(points),
      lineMaterial(color)
    )
  );

  return group;
};
