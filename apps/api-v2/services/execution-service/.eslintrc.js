module.exports = {
  root: true,
  extends: ['@repo/eslint-config/nest.js'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
};
