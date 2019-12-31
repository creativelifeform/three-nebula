import { shape, string } from 'prop-types';

import { Component } from 'react';
import Router from 'next/router';

const DEFAULT_EXAMPLE = 'custom-renderer';

class ExamplesPage extends Component {
  componentDidMount() {
    Router.push(`/examples/${DEFAULT_EXAMPLE}`);
  }

  render() {
    return null;
  }
}

ExamplesPage.propTypes = {
  query: shape({
    name: string,
  }),
};

export default ExamplesPage;
