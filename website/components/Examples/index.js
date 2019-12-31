import { Content, Page } from '../primitives';

import { EXAMPLE_NAME_TO_COMPONENT_MAP } from './constants';
import React from 'react';
import { Sidebar } from './Sidebar';
import { string } from 'prop-types';

const examplePropTypes = {
  name: string,
};

const Example = ({ name }) => {
  const Component = EXAMPLE_NAME_TO_COMPONENT_MAP[name];

  return Component ? <Component /> : null;
};

const Examples = ({ name }) => {
  return (
    <Page className="Examples">
      <Content>
        <Sidebar />
        <Example name={name} />
      </Content>
    </Page>
  );
};

Example.propTypes = examplePropTypes;
Examples.propTypes = examplePropTypes;

export default Examples;
