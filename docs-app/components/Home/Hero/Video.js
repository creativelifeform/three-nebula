import React from 'react';
import video from '../../../assets/hero-video.mp4';

export default () => (
  <video
    src={video}
    preload="auto"
    autoPlay={true}
    loop={true}
    className="Video"
    muted={true}
  />
);
