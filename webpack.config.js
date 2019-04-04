/*global __dirname, require, module*/

const path = require('path');

let libraryName = 'Nebula';

let plugins = [],
  outputFile;

outputFile = 'nebula-engine.js';

const config = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/build',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['.json', '.js'],
  },
  plugins: plugins,
};

module.exports = config;
