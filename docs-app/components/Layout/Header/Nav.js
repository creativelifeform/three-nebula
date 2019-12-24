import { Callout, NavLink } from '../../primitives';
import React, { Component } from 'react';
import { array, object } from 'prop-types';

import { withRouter } from 'next/router';

const Hamburger = ({ isOpen, toggle }) => (
  <div className="Hamburger" onClick={toggle}>
    menu
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
          </ul>
        </div>
      </nav>
    );
  }
}

Nav.propTypes = {
  routes: array.isRequired,
  router: object.isRequired,
};

export default withRouter(Nav);
