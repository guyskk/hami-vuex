const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const distPath = path.resolve(__dirname, "dist");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: distPath,
    filename: "index.js",
    library: {
      name: "HamiVuex",
      type: "umd",
    },
    clean: true,
  },
  externals: ["vue", "vuex"],
  devtool: "source-map",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/index.d.ts",
          to: path.join(distPath, "index.d.ts"),
        },
      ],
    }),
  ],
};
