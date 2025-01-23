module.exports = {
  root: true,
  extends: ['@shared/eslint-config/nest.js'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
  },
  ignorePatterns: ['dist/**/*', 'node_modules/**/*'],
};
