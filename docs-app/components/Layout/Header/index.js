import Logo from './Logo';
import Nav from './Nav';
import React from 'react';

export default ({ routes }) => (
  <header className="Header" style={{ top: '0px' }}>
    <Logo />
    <Nav routes={routes} />
  </header>
);
