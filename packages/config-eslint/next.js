/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    ...[
      "@vercel/style-guide/eslint/node",
      "@vercel/style-guide/eslint/typescript",
      "@vercel/style-guide/eslint/browser",
      "@vercel/style-guide/eslint/react",
      "@vercel/style-guide/eslint/next",
    ].map(require.resolve),
    "turbo",
  ],
  parserOptions: {
    // Remove the project reference here - it will be provided by the consuming service
    sourceType: "module",
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        // Remove the project reference here - it will be provided by the consuming service
      },
      node: {
        extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
      },
    },
    next: {
      rootDir: ["apps/*/"],
    },
  },
  ignorePatterns: ["node_modules/", "dist/", "**/*.css"],
  // add rules configurations here
  rules: {
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/dot-notation": "off",
    "import/no-default-export": "off",
    "import/no-unresolved": "warn",
  },
};
