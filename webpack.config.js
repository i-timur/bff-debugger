const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.ts",
    devtools: "./src/devtools.ts",
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
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/assets/icon.svg",
          to: "assets/icon.png",
        },
      ],
    }),
  ],
};
