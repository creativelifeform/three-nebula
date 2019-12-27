import { Content, Examples, Page } from '../../components';

import React from 'react';

export default () => {
  return (
    <Page className="Examples">
      <Content>
        <Examples query={{ name: 'custom-renderer' }} />
      </Content>
    </Page>
  );
};
