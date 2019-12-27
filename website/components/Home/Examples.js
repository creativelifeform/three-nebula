import { Content, Grid, GridItem, GridItemMedia } from '../primitives';
import { array, shape, string } from 'prop-types';

import React from 'react';
import { withContent } from '../../common/utils';

const Examples = ({
  content: {
    guide: { items },
    callout: { large },
  },
}) => (
  <Content className="Examples">
    <div className="wrap">
      {/* eslint-disable-next-line */}
      <a name="examples"></a>
      <h2>Examples</h2>
      <Grid>
        {items.map(({ title, text }) => (
          <GridItem key={title}>
            <GridItemMedia />
          </GridItem>
        ))}
      </Grid>
    </div>
  </Content>
);

Examples.propTypes = {
  content: shape({
    guide: shape({
      items: array,
    }),
    callout: shape({
      large: string,
    }),
  }),
};

export default withContent(Examples);
