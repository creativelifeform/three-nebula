import Link from 'next/link';
import Logo from '../../../assets/nebula-logo-web.svg';
import React from 'react';

export default () => (
  <div className="Logo">
    <Link href="/">
      <span className="logo-mark">
        <Logo />
      </span>
      <span className="logo-text">three nebula</span>
    </Link>
  </div>
);
