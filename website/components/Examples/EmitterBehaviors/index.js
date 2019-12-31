import { Nebula } from '../../primitives';
import React from 'react';
import { getSrcHref } from '../utils';
import particleSystemState from './data';

export default () => (
  <Nebula
    srcHref={getSrcHref('EmitterBehaviors/data.js')}
    json={{ particleSystemState }}
  />
);
