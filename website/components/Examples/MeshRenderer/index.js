import { Nebula } from '../../primitives';
import React from 'react';
import { getSrcHref } from '../utils';
import init from './init';

export default () => (
  <Nebula srcHref={getSrcHref('MeshRenderer/init.js')} init={init} />
);
