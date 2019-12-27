import React from 'react';
import { node } from 'prop-types';

export const GridItem = ({ children }) => (
  <div className="Item">{children}</div>
);

export { GridItemMedia } from './Media';
export { GridItemDetails } from './Details';

GridItem.propTypes = {
  children: node,
};
