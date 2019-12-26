import { shape, string } from 'prop-types';

import CustomRenderer from './CustomRenderer';
import EightDiagrams from './EightDiagrams';
import React from 'react';

const Examples = ({ query: { name } }) => {
  switch (name) {
    case 'custom-renderer':
      return <CustomRenderer />;
    case 'eight-diagrams':
      return <EightDiagrams />;
    default:
      return null;
  }
};

Examples.propTypes = {
  query: shape({
    name: string,
  }),
};

export default Examples;
