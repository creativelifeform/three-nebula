import { shape, string } from 'prop-types';

import CustomRenderer from './CustomRenderer';
import EightDiagrams from './EightDiagrams';
import EmitterBehaviors from './EmitterBehaviors';
import MeshRenderer from './MeshRenderer';
import MeshRendererCollision from './MeshRendererCollision';
import MeshZone from './MeshZone';
import React from 'react';
import SpriteRendererGravity from './SpriteRendererGravity';

const Examples = ({ query: { name } }) => {
  switch (name) {
    case 'custom-renderer':
      return <CustomRenderer />;
    case 'eight-diagrams':
      return <EightDiagrams />;
    case 'emitter-behaviors':
      return <EmitterBehaviors />;
    case 'mesh-renderer':
      return <MeshRenderer />;
    case 'mesh-renderer-collision':
      return <MeshRendererCollision />;
    case 'mesh-zone':
      return <MeshZone />;
    case 'sprite-renderer-gravity':
      return <SpriteRendererGravity />;
    default:
      return null;
  }
};

Examples.propTypes = {
  query: shape({
    name: string,
  }),
};

export default Examples;
