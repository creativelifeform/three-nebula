import { shape, string } from 'prop-types';

import React from 'react';
import { withContent } from '../../../common/utils';

const Favicon = ({
  content: {
    favicon: { title, description, url, twitterName, twitterImage },
  },
}) => (
  <>
    {/* FAVICON */}
    <link rel="shortcut icon" href={'/favicon/favicon.ico'} />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href={'/favicon/favicon-32x32.png'}
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href={'/favicon/favicon-16x16.png'}
    />
    <link rel="manifest" href={'/favicon/site.webmanifest'} />
    {/* APPLE */}
    <link
      rel="mask-icon"
      href={'/favicon/safari-pinned-tab.svg'}
      color="#4325fb"
    />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href={'/favicon/apple-touch-icon.png'}
    />

    {/* MS */}
    <meta name="msapplication-config" content={'/favicon/browserconfig.xml'} />
    <meta name="msapplication-TileColor" content="#000000" />
    <meta name="theme-color" content="#000000" />
    {/* TWITTER */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:name" content={twitterName} />
    <meta name="twitter:image" content={`${url}/og/three-nebula.jpg`} />
    {/* FACEBOOK */}
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:site_name" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:image:height" content="372" />
    <meta property="og:image:width" content="711" />
    <meta property="og:image" content={`${url}/og/og-image.jpg`} />
  </>
);

Favicon.propTypes = {
  content: shape({
    favicon: shape({
      title: string,
      description: string,
      url: string,
      twitterName: string,
      twitterImage: string,
    }),
  }),
};

export default withContent(Favicon);
