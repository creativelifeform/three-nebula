import { func, object, shape, string } from 'prop-types';

import { AnalyticsConsumer } from '../../context';
import Link from 'next/link';
import React from 'react';

const isAbsoluteHref = href => href.includes('http') || href.includes('https');

const AnchorTag = React.forwardRef(({ href, track, text }, ref) => (
  <a
    ref={ref}
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
));

export const CalloutLink = ({ href, text = 'Get the GUI' }) => {
  const isAbsoluteLink = isAbsoluteHref(href);

  return (
    <AnalyticsConsumer>
      {track =>
        isAbsoluteLink ? (
          <AnchorTag {...{ href, text, track }} />
        ) : (
          <Link href={href}>
            <AnchorTag {...{ href, text, track }} />
          </Link>
        )
      }
    </AnalyticsConsumer>
  );
};

AnchorTag.propTypes = {
  href: string,
  text: string,
  track: shape({
    event: func,
  }),
};

CalloutLink.propTypes = {
  href: string,
  text: string,
  className: string,
  router: object,
  onClick: func,
};
