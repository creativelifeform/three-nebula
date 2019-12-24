import { node, string } from 'prop-types';

import React from 'react';

export const Content = ({
  children,
  title = null,
  text = null,
  className = '',
}) => (
  <section className={`Content ${className}`}>
    {title && (
      <header>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </header>
    )}
    <section className="main">{children}</section>
  </section>
);

Content.propTypes = {
  children: node,
  title: string,
  text: string,
  className: string,
};
