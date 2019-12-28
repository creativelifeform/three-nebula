import { Content, Page } from '../primitives';
import { shape, string } from 'prop-types';

import { EXAMPLE_NAME_TO_COMPONENT_MAP } from './constants';
import React from 'react';
import { Sidebar } from './Sidebar';

const Example = ({ name }) => {
  const Component = EXAMPLE_NAME_TO_COMPONENT_MAP[name];

  return Component ? <Component /> : null;
};

const Examples = ({ query: { name } }) => {
  return (
    <Page className="Examples">
      <Content>
        <Sidebar />
        <Example name={name} />
      </Content>
    </Page>
  );
};

Examples.propTypes = {
  query: shape({
    name: string,
  }),
};

export default Examples;
