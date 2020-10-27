const withSass = require('@zeit/next-sass');
const withAssetsImport = require('next-assets-import');
const withProgressBar = require('next-progressbar');
const routes = require('./content/routes');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

require('dotenv').config();

const {
  env: { API_URL, TEST_EMAIL, UA_ID, SENTRY_DSN },
} = process;

module.exports = withBundleAnalyzer(
  withProgressBar(
    withSass(
      withAssetsImport({
        progressBar: {
          profile: true,
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
        webpack(config) {
          config.node = { fs: 'empty', net: 'empty', tls: 'empty' };

          return config;
        },
      })
    )
  )
);
