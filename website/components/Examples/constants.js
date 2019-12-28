import CustomRenderer from './CustomRenderer';
import EightDiagrams from './EightDiagrams';
import EmitterBehaviors from './EmitterBehaviors';
import MeshRenderer from './MeshRenderer';
import MeshRendererCollision from './MeshRendererCollision';
import MeshZone from './MeshZone';
import SpriteRendererGravity from './SpriteRendererGravity';
import SpriteRendererPointZone from './SpriteRendererPointZone';
import SpriteRendererSnow from './SpriteRendererSnow';

export const EXAMPLE_NAME_TO_COMPONENT_MAP = {
  'custom-renderer': CustomRenderer,
  'multiple-emitters': EightDiagrams,
  'emitter-behaviors': EmitterBehaviors,
  'mesh-emitter': MeshRenderer,
  'particle-collision': MeshRendererCollision,
  'mesh-zone': MeshZone,
  gravity: SpriteRendererGravity,
  'point-zone': SpriteRendererPointZone,
  snow: SpriteRendererSnow,
};

export const EXAMPLE_NAMES = Object.keys(EXAMPLE_NAME_TO_COMPONENT_MAP);
