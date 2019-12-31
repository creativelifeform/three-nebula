import { Code } from '../Code';
import React from 'react';
import { string } from 'prop-types';

export const ViewSource = ({ href }) => (
  <a
    href={href}
    className="ViewSource"
    target="_blank"
    rel="noopener noreferrer "
  >
    <Code>View Source</Code>
  </a>
);

ViewSource.propTypes = {
  href: string,
};
