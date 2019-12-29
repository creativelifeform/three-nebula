import {
  CalloutLink,
  Content,
  Grid,
  GridItem,
  GridItemDetails,
  GridItemMedia,
  NebulaLink,
} from '../primitives';
import { shape, string } from 'prop-types';

import { HREF_NEBULA } from '../../common/constants';
import React from 'react';
import { withContent } from '../../common/utils';

const AboutNebula = ({
  content: {
    about: { title, text },
    callout: { large },
  },
}) => (
  <Content className="AboutNebula">
    <Grid>
      <GridItem>
        <GridItemDetails title={title}>
          {text.items.map((paragraph, i) => {
            if (i === 0) {
              return (
                <p>
                  <NebulaLink />
                  {paragraph}
                </p>
              );
            }

            return <p>{paragraph}</p>;
          })}

          <CalloutLink href={HREF_NEBULA} text={'Get the desktop app'} />
        </GridItemDetails>
      </GridItem>
      <GridItem>
        <GridItemMedia src="/nebula-app.png" alt="Nebula" />
      </GridItem>
    </Grid>
  </Content>
);

AboutNebula.propTypes = {
  content: shape({
    about: shape({
      title: string,
      text: string,
    }),
    callout: shape({
      large: string,
    }),
  }),
};

export default withContent(AboutNebula);
