import Blurb from './Blurb';
import Canvas from './Canvas';
import { Content } from '../../primitives';
import React from 'react';

export default () => (
  <Content className="Hero">
    <Canvas />
    <Blurb />
  </Content>
);
