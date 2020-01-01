import { Nebula } from '../../primitives';
import React from 'react';
import { getSrcHref } from '../utils';
import particleSystemState from './data.json';

export default () => (
  <Nebula
    srcHref={getSrcHref('LifeCycleApi/data.json')}
    json={particleSystemState}
  />
);
