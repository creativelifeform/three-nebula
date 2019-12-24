import '../style/style.scss';

import { AnalyticsProvider } from '../context';
import App from 'next/app';
import { Layout } from '../components';
import React from 'react';
import Router from 'next/router';
import routes from '../content/routes';

class MyApp extends App {
  render() {
    const { Component, hasGdprConsent, ...pageProps } = this.props;
    const pathname = Router.router ? Router.router.pathname : undefined;

    return (
      <AnalyticsProvider pathname={pathname}>
        <Layout routes={routes}>
          <Component {...pageProps} />
        </Layout>
      </AnalyticsProvider>
    );
  }
}

export default MyApp;
