import React, { Component } from 'react';
import { shape, string } from 'prop-types';

import { Examples } from '../../components';
import Router from 'next/router';

const DEFAULT_EXAMPLE = 'custom-renderer';

class ExamplesPage extends Component {
  componentDidMount() {
    Router.push(`/examples/${DEFAULT_EXAMPLE}`);
  }

  render() {
    return <Examples />;
  }
}

ExamplesPage.propTypes = {
  query: shape({
    name: string,
  }),
};

export default ExamplesPage;
