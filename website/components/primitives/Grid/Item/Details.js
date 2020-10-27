import { node, string } from 'prop-types';

import React from 'react';

export const GridItemDetails = ({ children, title }) => (
  <div className="Details">
    {title && <h3>{title}</h3>}
    {children}
  </div>
);

GridItemDetails.propTypes = {
  children: node,
  title: string,
};
