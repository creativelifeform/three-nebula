import { CalloutLink, Code, ThreeLink } from '../../primitives';
import { func, shape, string } from 'prop-types';

import React from 'react';
import { withContent } from '../../../common/utils';
import { withRouter } from 'next/router';

const Blurb = ({
  content: {
    home: { title, text },
    callout: { large },
  },
  router,
}) => (
  <div className="Blurb">
    <h2>
      <Code>{title}</Code>
    </h2>
    <p>
      {text}
      <ThreeLink text={'three.js'} />
    </p>
    <CalloutLink text={large} href={'/examples'} />
  </div>
);

Blurb.propTypes = {
  content: shape({
    home: shape({
      title: string,
      text: string,
    }),
    callout: shape({
      large: string,
    }),
  }),
  router: shape({
    push: func,
  }),
};

export default withContent(withRouter(Blurb));
