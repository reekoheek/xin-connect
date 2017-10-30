const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const glob = require('glob');

module.exports = function (env = {}) {
  let { port = 8080, minify = false, mode = 'example' } = env;
  console.error('env=', env);

  return {
    context: path.join(__dirname, `./${mode}`),
    entry: {
      index: './index.js',
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: `[name]${minify ? '.min' : ''}.js`,
    },
    devtool: 'source-map',
    plugins: getPlugins(env),
    module: {
      rules: [
        {
          test: /\.css$/,
          // exclude: /node_modules/,
          use: [ 'style-loader', 'css-loader' ],
        },
        {
          test: /\.html$/,
          use: 'html-loader',
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: getBabelLoader(),
        },
      ],
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: port,
    },
  };
};

function getBabelLoader () {
  return {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins: [
        // require.resolve('babel-plugin-istanbul'),
        // require.resolve('babel-plugin-__coverage__'),
        // [ require.resolve('babel-plugin-__coverage__'), { 'ignore': 'node_modules' } ],
        // 'babel-plugin-syntax-dynamic-import',
        // 'babel-plugin-transform-async-to-generator',
      ],
      presets: [
      //   'babel-preset-es2015',
      //   'babel-preset-stage-3',
      ],
      cacheDirectory: true,
    },
  };
}

function getPlugins ({ minify = false } = {}) {
  let plugins = [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
  ];

  // if (minify) {
  //   plugins.push(
  //     new BabiliPlugin()
  //   );
  // }

  return plugins;
}

// // FIXME please add component tests
// function getEntries () {
//   const entries = {};

//   glob.sync('./test/**/*.test.js').forEach(test => (entries[test.match(/\/(test\/.*).js$/)[1]] = test));

//   return entries;
// }
