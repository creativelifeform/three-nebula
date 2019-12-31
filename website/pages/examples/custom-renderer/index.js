import { Examples } from '../../../components';
import React from 'react';
import dynamic from 'next/dynamic';

const Example = dynamic(() =>
  import('../../../components/Examples/CustomRenderer')
);

export default () => (
  <Examples>
    <Example />
  </Examples>
);
