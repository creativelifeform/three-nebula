import dynamic from 'next/dynamic';

const CustomRenderer = dynamic(() => import('./CustomRenderer'));
const EightDiagrams = dynamic(() => import('./EightDiagrams'));
const EmitterBehaviors = dynamic(() => import('./EmitterBehaviors'));
const MeshRenderer = dynamic(() => import('./MeshRenderer'));
const MeshRendererCollision = dynamic(() => import('./MeshRendererCollision'));
const MeshZone = dynamic(() => import('./MeshZone'));
const Gravity = dynamic(() => import('./SpriteRendererGravity'));
const PointZone = dynamic(() => import('./SpriteRendererPointZone'));
const SpriteRendererSnow = dynamic(() => import('./SpriteRendererSnow'));

export const EXAMPLE_NAME_TO_COMPONENT_MAP = {
  'custom-renderer': CustomRenderer,
  'multiple-emitters': EightDiagrams,
  'emitter-behaviors': EmitterBehaviors,
  'mesh-emitter': MeshRenderer,
  'particle-collision': MeshRendererCollision,
  'mesh-zone': MeshZone,
  gravity: Gravity,
  'point-zone': PointZone,
  snow: SpriteRendererSnow,
};

export const EXAMPLE_NAMES = Object.keys(EXAMPLE_NAME_TO_COMPONENT_MAP);
