const withSass = require('@zeit/next-sass');
const withAssetsImport = require('next-assets-import');
const withProgressBar = require('next-progressbar');
const routes = require('./content/routes');

require('dotenv').config();

const {
  env: { API_URL, TEST_EMAIL, UA_ID, SENTRY_DSN },
} = process;

module.exports = withProgressBar(
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
);
