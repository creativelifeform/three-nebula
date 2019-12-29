import AboutNebula from './AboutNebula';
import Features from './Features';
import Hero from './Hero';
import { Page } from '../primitives';
import React from 'react';

export default () => (
  <Page className="Home">
    <Hero />
    <Features />
    <AboutNebula />
  </Page>
);
