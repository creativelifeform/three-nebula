import React from 'react';
import content from '../content';

/**
 * Provides textual content to pages as a prop.
 *
 */
export const withContent = WrappedComponent => props => (
  <WrappedComponent content={content} {...props} />
);

export const mapValueToKey = (object, value) =>
  Object.keys(object).find(key => object[key] === value);

export const toInt = value => value | 0;
