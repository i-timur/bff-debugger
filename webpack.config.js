const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist/browser/browser"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.background.json",
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    minimize: false,
  },
};
