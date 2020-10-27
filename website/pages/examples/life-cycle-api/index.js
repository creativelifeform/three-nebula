import { Examples } from '../../../components';
import React from 'react';
import dynamic from 'next/dynamic';

const Example = dynamic(() =>
  import('../../../components/Examples/LifeCycleApi')
);

export default () => (
  <Examples>
    <Example />
  </Examples>
);
