import Link from 'next/link';
import Logo from '../../../assets/nebula-logo-web.svg';
import React from 'react';

export default () => (
  <div className="Logo">
    <Link href="/">
      <a href="/">
        <span className="logo-mark">
          <Logo />
        </span>
        <span className="logo-text">three nebula</span>
      </a>
    </Link>
  </div>
);
