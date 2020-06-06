module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: [],
  rules: {
    'no-console': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8,
  },
};
