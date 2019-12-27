import { bool, node } from 'prop-types';

import React from 'react';

export const Code = ({ children, inline = true }) =>
  inline ? (
    <span className="Code">{children}</span>
  ) : (
    <div className="Code">{children}</div>
  );

Code.propTypes = {
  children: node,
  inline: bool,
};
