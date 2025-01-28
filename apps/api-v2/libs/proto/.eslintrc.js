module.exports = {
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
  rules: {
    "no-console": "off",
    "import/no-cycle": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-misused-promises": "off",
  },
  ignorePatterns: ["dist/**/*", "node_modules/**/*", "src/generated/**/*"],
};
