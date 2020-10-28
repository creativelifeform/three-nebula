import React, { Component } from 'react';
import { array, bool, func, object } from 'prop-types';

import { NavLink } from '../../primitives';
import SpectrumLogo from './SpectrumLogo';
import { withRouter } from 'next/router';

const Hamburger = ({ isOpen, toggle }) => (
  <div className="Hamburger" onClick={toggle}>
    {isOpen ? 'close' : 'menu'}
  </div>
);

class Nav extends Component {
  state = {
    mobileMenuIsActive: false,
  };

  handleMobileMenuToggle = e => {
    const { mobileMenuIsActive } = this.state;

    this.setState({ mobileMenuIsActive: !mobileMenuIsActive });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.router.pathname !== this.props.router.pathname) {
      this.setState({ mobileMenuIsActive: false });
    }
  }

  render() {
    const { routes } = this.props;
    const { mobileMenuIsActive } = this.state;
    const activeClass = mobileMenuIsActive ? 'active' : '';

    return (
      <nav className="Nav">
        <Hamburger
          isOpen={mobileMenuIsActive}
          toggle={this.handleMobileMenuToggle}
        />
        <div className={`ul-container ${activeClass}`}>
          <ul className={`${activeClass}`}>
            {routes.map(({ path, name, url, shouldHideFromNav }, i) =>
              shouldHideFromNav ? null : (
                <li key={i}>
                  <NavLink href={path} name={name} url={url} />
                </li>
              )
            )}
            {/* <li className="spectrum-logo-container">
              <SpectrumLogo />
            </li> */}
          </ul>
        </div>
      </nav>
    );
  }
}

Hamburger.propTypes = {
  isOpen: bool,
  toggle: func,
};

Nav.propTypes = {
  routes: array.isRequired,
  router: object.isRequired,
};

export default withRouter(Nav);
