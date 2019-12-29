import { Content, Grid, GridItem, GridItemDetails } from '../../primitives';
import {
  HREF_DOCS,
  HREF_GITHUB,
  HREF_NPM,
  HREF_SPECTRUM,
  HREF_THREE_JS_DOCS,
  HREF_TWITTER,
} from '../../../common/constants';

import React from 'react';

const date = new Date();

export default () => (
  <footer className="Footer">
    <Content>
      <Grid>
        <GridItem>
          <GridItemDetails title="Documentation">
            <ul>
              <li>
                <a href={HREF_DOCS}>three-nebula</a>
              </li>
              <li>
                <a href={HREF_THREE_JS_DOCS}>three</a>
              </li>
            </ul>
          </GridItemDetails>
        </GridItem>
        <GridItem>
          <GridItemDetails title="Community">
            <ul>
              <li>
                <a href={HREF_SPECTRUM}>Spectrum</a>
              </li>
            </ul>
          </GridItemDetails>
        </GridItem>
        <GridItem>
          <GridItemDetails title="Social">
            <ul>
              <li>
                <a href={HREF_TWITTER}>Twitter</a>
              </li>
            </ul>
          </GridItemDetails>
        </GridItem>
        <GridItem>
          <GridItemDetails title="Code">
            <ul>
              <li>
                <a href={HREF_GITHUB}>Github</a>
              </li>
              <li>
                <a href={HREF_NPM}>npm</a>
              </li>
            </ul>
          </GridItemDetails>
        </GridItem>
      </Grid>
      <div className="copyright">
        © <a href="http://creativelifeform.com">Creativelifeform</a>{' '}
        {date.getFullYear()}
      </div>
    </Content>
  </footer>
);
