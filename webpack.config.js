const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    index: path.resolve(__dirname, "src", "index.ts"),
    doer: "./examples/doer.js",
    watcher: "./examples/watcher.js",
    publisher: "./examples/publisher.js",
    subscriber: "./examples/subscriber.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json"),
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  performance: { hints: false },
  resolve: {
    extensions: [".js", ".ts", ".json"],
  },
  target: "node",
};
