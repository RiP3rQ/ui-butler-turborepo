module.exports = {
  root: true,
  extends: ['@repo/eslint-config/nest.js'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {
    camelcase: 'off',
    'no-console': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/require-await': 'off',
  },
  ignorePatterns: ['dist/**/*', 'node_modules/**/*'],
};
