import Examples from './Examples';
import Guide from './Guide';
import Hero from './Hero';
import { Page } from '../primitives';
import React from 'react';

export default () => (
  <Page className="Home">
    <Hero />
    <Guide />
    <Examples />
  </Page>
);
