import React from 'react';
import { node } from 'prop-types';

export const Sidebar = ({ children }) => (
  <aside className="Sidebar">{children}</aside>
);

Sidebar.propTypes = {
  children: node,
};
