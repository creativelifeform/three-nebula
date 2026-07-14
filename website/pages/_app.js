import '../style/style.scss';

import { AnalyticsProvider } from '../context';
import App from 'next/app';
import { Layout } from '../components';
import React from 'react';

const routes = require('../content/routes');

class MyApp extends App {
  render() {
    const { Component, ...pageProps } = this.props;

    return (
      <AnalyticsProvider>
        <Layout routes={routes}>
          <Component {...pageProps} />
        </Layout>
      </AnalyticsProvider>
    );
  }
}

export default MyApp;
