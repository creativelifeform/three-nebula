import { Content, Examples, Page } from '../../components';

import React from 'react';
import { useRouter } from 'next/router';

export default () => {
  const { query } = useRouter();

  console.log('examples');

  return (
    <Page className="Examples">
      <Content>
        <Examples query={query} />
      </Content>
    </Page>
  );
};
