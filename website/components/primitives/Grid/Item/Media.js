import { node, string } from 'prop-types';

import React from 'react';

export const GridItemMedia = ({
  children,
  type = 'image',
  alt = '',
  src = '',
}) => {
  if (children) {
    return <div className="Media">{children}</div>;
  }
  switch (type) {
    case 'image':
      return <img src={src} alt={alt} className={'Media'} />;
    default:
      return <div className={'Media'} />;
  }
};

GridItemMedia.propTypes = {
  children: node,
  type: string,
  alt: string,
  src: string,
};
