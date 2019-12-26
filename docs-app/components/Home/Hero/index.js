import { Content, Nebula } from '../../primitives';

import Blurb from './Blurb';
import React from 'react';
import json from './particles';

export default () => (
  <Content className="Hero">
    <Nebula json={json} />
    <Blurb />
  </Content>
);
