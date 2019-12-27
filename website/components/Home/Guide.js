import { Content, Grid, GridItem, GridItemDetails } from '../primitives';
import { array, shape, string } from 'prop-types';

import React from 'react';
import { withContent } from '../../common/utils';

const Guide = ({
  content: {
    guide: { items },
    callout: { large },
  },
}) => (
  <Content className="Guide">
    <Grid>
      {items.map(({ title, text }) => (
        <GridItem key={title}>
          <GridItemDetails title={title}>
            <p>{text}</p>
          </GridItemDetails>
        </GridItem>
      ))}
    </Grid>
  </Content>
);

Guide.propTypes = {
  content: shape({
    guide: shape({
      items: array,
    }),
    callout: shape({
      large: string,
    }),
  }),
};

export default withContent(Guide);
