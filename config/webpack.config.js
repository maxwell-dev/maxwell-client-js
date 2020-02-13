const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    lib: "./index.js",
    // connection: './test/connection.js',
    // subscriber: './test/subscriber.js',
    // doer: "./test/doer.js"
    watcher: "./test/watcher.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/"
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Maxwell Client Test"
    })
  ],
  devtool: "inline-source-map",
  devServer: {
    port: 9001,
    publicPath: "/",
    contentBase: [path.resolve(__dirname, "../dist")],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept"
    }
  }
};
