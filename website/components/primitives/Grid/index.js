import { node, string } from 'prop-types';

import React from 'react';

export const Grid = ({ children, className = '' }) => (
  <div className={`Grid ${className}`}>{children}</div>
);

export { GridItem, GridItemMedia, GridItemDetails } from './Item';

Grid.propTypes = {
  children: node,
  className: string,
};
