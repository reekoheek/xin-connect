const path = require('path');
const webpack = require('webpack');

module.exports = function (env) {
  console.log(env);

  return {
    entry: {
      // 'connect-online': './connect-online.js',

      'connect-online.test': './test/connect-online.test.js',
      'connect-fetch.test': './test/connect-fetch.test.js',
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
    },
    devtool: 'source-map',
    devServer: {
      historyApiFallback: false,
      inline: false,
      hot: false,
      host: '0.0.0.0',
      port: 8080,
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        children: true,
        async: true,
      }),
    ],
    module: {
      loaders: [
        {
          test: /\.test.js$/,
          exclude: /node_modules/,
          loader: require.resolve('mocha-loader'),
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          query: {
            babelrc: false,
            plugins: [
              require.resolve('babel-plugin-transform-async-to-generator'),
            ],
            // presets: [
            //   require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-3'),
            // ],
            cacheDirectory: true,
          },
        },
      ],
    },
  };
};
