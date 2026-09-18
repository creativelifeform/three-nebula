import {
  VectorVelocity,
  RadialVelocity,
  Force,
  Vector3D,
  Span,
} from 'three-nebula';

const UP = new Vector3D(0, 1, 0);

// Optional "emit-in-shape, then travel" motion for the zone experiments, toggled
// by query string:
//   ?vector-velocity=true  → a fixed upward launch  (VectorVelocity)
//   ?radial-velocity=true  → an outward/upward spray (RadialVelocity)
//   ?force=true            → gravity, so launched particles arc back (Force)
//
// The point: the Zone sets *where* particles start; a velocity *initializer* sets
// *which way* they launch (set once at birth); a Force *behaviour* applies ongoing
// acceleration. Position and direction are decoupled — unlike the coupled "Shape"
// model — so any shape composes with any launch direction and any force.
export const readZoneMotion = ({ speed = 220, gravity = 1.5 } = {}) => {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const vector = params.get('vector-velocity') === 'true';
  const radial = params.get('radial-velocity') === 'true';
  const force = params.get('force') === 'true';

  const velocityInitializers = [];

  if (vector) {
    velocityInitializers.push(new VectorVelocity(new Vector3D(0, speed, 0), 6));
  }

  if (radial) {
    velocityInitializers.push(
      new RadialVelocity(new Span(speed * 0.6, speed), UP, 55)
    );
  }

  const forceBehaviours = force ? [new Force(0, -gravity, 0)] : [];

  return {
    velocityInitializers,
    forceBehaviours,
    moving: vector || radial || force,
  };
};
