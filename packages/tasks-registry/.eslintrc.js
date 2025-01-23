module.exports = {
  root: true,
  extends: ["@shared/eslint-config/react.js"],
  parser: "@typescript-eslint/parser",
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
    "@typescript-eslint/prefer-nullish-coalescing": "off", // Disable until strictNullChecks is enabled
    "@typescript-eslint/naming-convention": "off",
    "no-console": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
  ignorePatterns: [".eslintrc.js", "dist", "node_modules"],
};
