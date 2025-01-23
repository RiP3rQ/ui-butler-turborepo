module.exports = {
  extends: ["@shared/eslint-config/library.js"],
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
  rules: {
    "no-console": "off",
  },
  ignorePatterns: ["dist/**/*", "node_modules/**/*"],
};
