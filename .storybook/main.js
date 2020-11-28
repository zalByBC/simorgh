const webpack = require('webpack');
const path = require('path');
const { webpackDirAlias } = require('../dirAlias');

module.exports = {
  stories: ['../src/app/**/**/*.stories.jsx'],
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  webpackFinal: async config => {
    config.plugins.push(
      /*
       * This replaces calls to logger.node.js with logger.web.js, a client
       * side replacement. This mimics the behaviour of the client side
       * bundle generation in webpack.config.client.js
       */
      new webpack.NormalModuleReplacementPlugin(
        /(.*)logger.node(\.*)/,
        resource => {
          // eslint-disable-next-line no-param-reassign
          resource.request = resource.request.replace(
            /logger.node/,
            `logger.web`,
          );
        },
      ),
    ),
      (config.resolve.modules = [
        path.resolve(__dirname, '..'),
        'node_modules',
      ]);
    config.resolve.extensions.push('.js', '.jsx'); // resolves `import '../Foo'` to `../Foo/index.jsx`
    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackDirAlias,
    };

    return config;
  },
};
