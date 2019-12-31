import { Content, Page } from '../primitives';
import { node, string } from 'prop-types';

import React from 'react';
import { Sidebar } from './Sidebar';

const Examples = ({ name, children }) => {
  return (
    <Page className="Examples">
      <Content>
        <Sidebar />
        {children}
      </Content>
    </Page>
  );
};

Examples.propTypes = {
  name: string,
  children: node,
};

export default Examples;
