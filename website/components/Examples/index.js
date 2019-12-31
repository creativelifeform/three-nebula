import { Content, Page } from '../primitives';

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

export default Examples;
