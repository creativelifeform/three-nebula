import Logo from './Logo';
import Nav from './Nav';
import React from 'react';
import { array } from 'prop-types';

const Header = ({ routes }) => (
  <header className="Header" style={{ top: '0px' }}>
    <Logo />
    <Nav routes={routes} />
  </header>
);

Header.propTypes = {
  routes: array,
};

export default Header;
