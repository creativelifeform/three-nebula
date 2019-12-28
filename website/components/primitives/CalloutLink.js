import { func, object, string } from 'prop-types';

import { AnalyticsConsumer } from '../../context';
import Link from 'next/link';
import React from 'react';

export const CalloutLink = ({ href, text = 'Get the GUI' }) => (
  <AnalyticsConsumer>
    {track => (
      <Link href={href}>
        <a
          className="button"
          href={href}
          onClick={e => {
            track
              .event({
                ec: 'CALLOUT LINK',
                ea: 'click',
                dp: href,
              })
              .send();
          }}
        >
          {text}
        </a>
      </Link>
    )}
  </AnalyticsConsumer>
);

CalloutLink.propTypes = {
  href: string,
  text: string,
  className: string,
  router: object,
  onClick: func,
};
