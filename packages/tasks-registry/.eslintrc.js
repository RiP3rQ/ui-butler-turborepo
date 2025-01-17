module.exports = {
  extends: ["@repo/eslint-config/library.js"],
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
};
