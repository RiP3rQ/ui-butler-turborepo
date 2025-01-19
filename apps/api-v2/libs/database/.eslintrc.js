module.exports = {
  extends: ["@repo/eslint-config/library.js"],
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
    "import/no-cycle": "off",
    "@typescript-eslint/no-extraneous-class": "off",
  },
  ignorePatterns: ["dist/**/*", "node_modules/**/*"],
};
