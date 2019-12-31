import React, { Component } from 'react';
import { shape, string } from 'prop-types';

import { Examples } from '../../components';
import Router from 'next/router';

class ExamplesPage extends Component {
  static defaultProps = {
    query: undefined,
  };

  componentDidMount() {
    !this.props.query && Router.push('/examples/custom-renderer');
  }

  render() {
    const { query } = this.props;

    return <Examples name={query ? query.name : undefined} />;
  }
}

ExamplesPage.propTypes = {
  query: shape({
    name: string,
  }),
};

export default ExamplesPage;
