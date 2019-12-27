import { node, string } from 'prop-types';

import React from 'react';

export const Page = ({ children, className = '' }) => (
  <section className={`Page ${className}`}>{children}</section>
);

export { Content } from './Content';

Page.propTypes = {
  children: node,
  className: string,
};
