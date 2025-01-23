module.exports = {
  root: true,
  extends: ["@shared/eslint-config/nest.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  ignorePatterns: [".eslintrc.js", "dist", "node_modules"],
};
