import { HREF_SPECTRUM } from '../../../common/constants';
import Logo from '../../../assets/spectrum-logo.svg';
import React from 'react';

export default () => (
  <span className="SpectrumLogo">
    <a href={HREF_SPECTRUM}>
      <Logo />
    </a>
  </span>
);
