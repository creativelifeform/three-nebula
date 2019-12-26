import { Content, Page } from '../../components';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const CustomRenderer = dynamic(
  () => import('../../components/Examples/CustomRenderer'),
  { ssr: false }
);

export default () => {
  const router = useRouter();

  return (
    <Page>
      <Content>
        <CustomRenderer />
      </Content>
    </Page>
  );
};
