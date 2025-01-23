module.exports = {
  root: true,
  extends: ['@shared/eslint-config/nest.js'],
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
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    'import/order': 'off',
  },
  ignorePatterns: ['dist/**/*', 'node_modules/**/*'],
};
