import React from 'react';
import { string } from 'prop-types';

export const Hyperlink = ({ href, text }) => <a href={href}>{text}</a>;

Hyperlink.propTypes = {
  href: string.isRequired,
  text: string,
};
