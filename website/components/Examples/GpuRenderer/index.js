import { Nebula } from '../../primitives';
import React from 'react';
import { getSrcHref } from '../utils';
import particleSystemState from './data';

const webGlRendererOptions = {
  alpha: false,
  antialias: true,
  clearColor: '#111111',
};

export default () => (
  <Nebula
    srcHref={getSrcHref('GpuRenderer/data.js')}
    json={{ particleSystemState }}
    shouldRotateCamera={false}
    webGlRendererOptions={webGlRendererOptions}
  />
);
