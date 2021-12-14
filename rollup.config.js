import copy from "rollup-plugin-copy";

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "umd",
    sourcemap: true,
    name: "HamiVuex",
    globals: {
      vue: "Vue",
      vuex: "Vuex",
    },
  },
  external: ["vue", "vuex"],
  plugins: [
    copy({
      targets: [{ src: "src/*.d.ts", dest: "dist/" }],
    }),
  ],
};
