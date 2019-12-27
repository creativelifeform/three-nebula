import { Hyperlink } from './Hyperlink';
import React from 'react';
import { string } from 'prop-types';

export const ThreeLink = ({ text = 'three' }) => (
  <Hyperlink href="https://threejs.org" text={text} />
);

ThreeLink.propTypes = {
  text: string,
};
