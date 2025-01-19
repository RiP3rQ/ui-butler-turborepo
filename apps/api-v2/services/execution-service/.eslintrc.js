module.exports = {
  root: true,
  extends: ['@repo/eslint-config/nest.js'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
  },
  ignorePatterns: ['dist/**/*', 'node_modules/**/*'],
};
