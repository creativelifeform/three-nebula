import { shape, string } from 'prop-types';

import { Examples } from '../../components';
import React from 'react';

const ExamplesPage = ({ query = { name: 'custom-renderer' } }) => {
  return <Examples query={query} />;
};

ExamplesPage.propTypes = {
  query: shape({
    name: string,
  }),
};

export default ExamplesPage;
