import { Nebula } from '../../primitives';
import React from 'react';
import init from './init';

export default () => <Nebula init={init} shouldRotateCamera={true} />;
