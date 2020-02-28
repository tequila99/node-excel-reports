const path = require('path')

module.exports = {
  entry: [
    'regenerator-runtime/runtime',
    './src/index.js'
  ],
  target: 'node',
  node: {
    __dirname: false
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.bundle.js'
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        exclude: /(node_modules)/,
        test: /\.js$/
      }
    ]
  }
}
