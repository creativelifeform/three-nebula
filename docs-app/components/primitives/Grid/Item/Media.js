import React from 'react';
import { string } from 'prop-types';

export const GridItemMedia = ({ type = 'image', alt = '', src = '' }) => {
  switch (type) {
    case 'image':
      return <img src={src} alt={alt} className={'Media'} />;
    default:
      return <div className={'Media'} />;
  }
};

GridItemMedia.propTypes = {
  type: string,
  alt: string,
  src: string,
};
