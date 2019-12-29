import { HREF_THREE_JS } from '../../../common/constants';
import { Hyperlink } from './Hyperlink';
import React from 'react';
import { string } from 'prop-types';

export const ThreeLink = ({ text = 'three' }) => (
  <Hyperlink href={HREF_THREE_JS} text={text} />
);

ThreeLink.propTypes = {
  text: string,
};
