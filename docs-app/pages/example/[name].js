import { Content, Examples, Page } from '../../components';

import React from 'react';
import { useRouter } from 'next/router';

export default () => {
  const { query } = useRouter();

  return (
    <Page className="Example">
      <Content>
        <Examples query={query} />
      </Content>
    </Page>
  );
};
