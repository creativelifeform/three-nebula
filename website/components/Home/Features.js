import { Content, Grid, GridItem, GridItemDetails } from '../primitives';
import { array, shape, string } from 'prop-types';

import React from 'react';
import { withContent } from '../../common/utils';

const Features = ({
  content: {
    features: { items },
    callout: { large },
  },
}) => (
  <Content className="Features">
    <Grid>
      {items.map(({ title, text, link }) => (
        <GridItem key={title}>
          <GridItemDetails title={title}>
            <p>{text}</p>
            <a href={link.href}>{link.text}</a>
          </GridItemDetails>
        </GridItem>
      ))}
    </Grid>
  </Content>
);

Features.propTypes = {
  content: shape({
    features: shape({
      items: array,
    }),
    callout: shape({
      large: string,
    }),
  }),
};

export default withContent(Features);
