import React, { Component, createContext } from 'react';
import { UA_ID, __DEV__ } from '../../common/config';
import { node, string } from 'prop-types';

const defaultApi = {
  event: ({ ec, ea, el, ev, dp }) => ({
    send: () => __DEV__ && console.table([{ ec, ea, el, ev, dp }]),
  }),
  pageview: path => ({
    send: () => __DEV__ && console.log(`Tracking pageview ${path}`),
  }),
};
const { Provider, Consumer: AnalyticsConsumer } = createContext(defaultApi);

/**
 * Provides the universal analytics API to consumers and tracks page views.
 *
 */
export default class AnalyticsProvider extends Component {
  state = {
    api: defaultApi,
  };

  /**
   * Tracks page views once the API has been set.
   *
   * @return {null}
   */
  static getDerivedStateFromProps({ pathname }, { api }) {
    api._translateParams && api.pageview(pathname).send();

    return null;
  }

  /**
   * Sets the correct API to pass to consumers if we are client side.
   * Ensures that IP addresses are anonymously sent to Google.
   *
   */
  componentDidMount() {
    const ua = require('universal-analytics');
    const { uid } = this;
    const api = ua(UA_ID, { uid });

    api.set('anonymizeIp', true);

    this.setState({ api });
  }

  /**
   * Ensures a consistent user is tracked.
   *
   * @return {string|number}
   */
  get uid() {
    const uid = __DEV__
      ? 'TEST_USER'
      : localStorage.getItem('UA_USER_ID') || Date.now();

    localStorage.setItem('UA_USER_ID', uid);

    return uid;
  }

  render() {
    const { api } = this.state;
    const { children } = this.props;

    return <Provider value={api}>{children}</Provider>;
  }
}

AnalyticsProvider.propTypes = {
  children: node,
  pathname: string,
};

export { AnalyticsConsumer };
