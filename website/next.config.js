const withAssetsImport = require('next-assets-import');
const routes = require('./content/routes');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const path = require('path');

require('dotenv').config();

const {
  env: { API_URL, TEST_EMAIL, UA_ID, SENTRY_DSN },
} = process;

module.exports = withBundleAnalyzer(
  withAssetsImport({
    // https://stackoverflow.com/a/68012194
    images: {
      disableStaticImages: true,
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'style')],
    },
    env: {
      API_URL,
      TEST_EMAIL,
      UA_ID,
      SENTRY_DSN,
    },
    exportPathMap: function() {
      const map = {};

      routes.forEach(({ path }) => {
        if (!path) {
          return;
        }

        map[path] = { page: path };
      });

      return map;
    },
    webpack(config, { isServer }) {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          ...{
            fs: false,
            net: false,
            tls: false,
          },
        };
      }

      return config;
    },
  })
);
