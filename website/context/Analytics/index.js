import React, { createContext } from 'react';

import { __DEV__ } from '../../common/config';
import { node } from 'prop-types';

/**
 * Analytics seam.
 *
 * Universal Analytics was removed — Google sunset UA in 2023 (it no longer
 * collects data), and the `universal-analytics` package pulled critical
 * vulnerabilities in through the deprecated `request` dependency. The consumer
 * API (`track.event({...}).send()`, `track.pageview(path).send()`) is preserved
 * as a no-op so components don't change; wiring a replacement is localised here.
 *
 * TODO: forward events/pageviews to a replacement — GA4 via
 * `@next/third-parties` (`sendGAEvent`) or a privacy-first tool (Plausible /
 * Fathom / Umami). Needs a measurement id / domain.
 */
const track = {
  event: ({ ec, ea, el, ev, dp } = {}) => ({
    send: () => __DEV__ && console.table([{ ec, ea, el, ev, dp }]),
  }),
  pageview: path => ({
    send: () => __DEV__ && console.log(`Tracking pageview ${path}`),
  }),
};

const { Provider, Consumer: AnalyticsConsumer } = createContext(track);

const AnalyticsProvider = ({ children }) => (
  <Provider value={track}>{children}</Provider>
);

AnalyticsProvider.propTypes = {
  children: node,
};

export default AnalyticsProvider;
export { AnalyticsConsumer };
