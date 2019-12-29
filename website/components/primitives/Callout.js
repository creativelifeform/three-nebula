import { func, object, string } from 'prop-types';

import { AnalyticsConsumer } from '../../context';
import React from 'react';
import { withRouter } from 'next/router';

const Component = ({
  text = 'Get the GUI',
  className = '',
  router,
  onClick = e => router.push('/'),
}) => (
  <AnalyticsConsumer>
    {track => (
      <button
        onClick={e => {
          track
            .event({
              ec: 'CALLOUT',
              ea: 'click',
              dp: router.pathname,
            })
            .send();

          onClick(e, track);
        }}
        className={className}
      >
        {text}
      </button>
    )}
  </AnalyticsConsumer>
);

Component.propTypes = {
  text: string,
  className: string,
  router: object,
  onClick: func,
};

export const Callout = withRouter(Component);
