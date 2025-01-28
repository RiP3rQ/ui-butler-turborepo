import tseslint from "typescript-eslint";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for NestJS applications.
 *
 * @type {import('eslint').Linter.Config}
 */
export const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/camelcase": "off",
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
  {
    ignores: ["node_modules/", "dist/", "**/*.js"],
  },
];
