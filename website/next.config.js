const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

require('dotenv').config();

const {
  env: { API_URL, TEST_EMAIL, UA_ID, SENTRY_DSN },
} = process;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export (replaces the removed `next export` / `exportPathMap`).
  output: 'export',
  images: { unoptimized: true, disableStaticImages: true },
  sassOptions: { includePaths: [path.join(__dirname, 'style')] },
  env: { API_URL, TEST_EMAIL, UA_ID, SENTRY_DSN },
  // The library is linted/tested in its own pipeline; don't gate the site build.
  eslint: { ignoreDuringBuilds: true },
  webpack(config, { isServer }) {
    // Dogfood the local three-nebula source (the current, unreleased library)
    // rather than a published npm build — mirrors the VR harness alias.
    config.resolve.alias['three-nebula'] = path.resolve(
      __dirname,
      '../src/index.js'
    );

    // Import image assets as plain URLs — examples call
    // `new THREE.TextureLoader().load(dotPng)` with the import.
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/i,
      type: 'asset/resource',
    });

    // SVGs import as React components (replaces the old babel inline-react-svg).
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
