const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * This is a custom ESLint configuration for use with NestJS apps.
 * This config extends the Vercel Engineering Style Guide with NestJS-specific rules.
 */

module.exports = {
  extends: [
    "@vercel/style-guide/eslint/node",
    "@vercel/style-guide/eslint/typescript",
  ].map(require.resolve),
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project,
    sourceType: "module",
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
      node: {
        extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  ignorePatterns: ["node_modules/", "dist/", ".eslintrc.js"],
  rules: {
    // Include Nest.js recommended rules directly
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/type-annotation-spacing": "error",

    // My specific rules
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "error", // Changed to error - it's better to explicitly type
    "import/prefer-default-export": "off", // Add this for better Nest.js compatibility
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      { overrides: { constructors: "off" } },
    ], // Add this for better Nest.js class handling
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // Add this for better variable handling
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.spec.ts", "**/*.e2e-spec.ts", "**/*.test.ts"],
      },
    ],
  },
};
