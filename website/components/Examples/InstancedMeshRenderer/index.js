import { Nebula } from '../../primitives';
import React from 'react';
import { getSrcHref } from '../utils';
import init from './init';

export default () => (
  <Nebula
    srcHref={getSrcHref('InstancedMeshRenderer/init.js')}
    init={init}
    shouldRotateCamera={true}
  />
);
