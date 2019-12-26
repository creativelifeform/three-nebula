import { Nebula } from '../../primitives';
import React from 'react';
import init from './init';

export default () => (
  <section>
    <h2>Custom Renderer</h2>
    <Nebula init={init} />
  </section>
);
