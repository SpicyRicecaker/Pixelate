module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: ['airbnb-base'], ['prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 0,
    'prettier/prettier': ['error'],
  },
  settings: {
    'import/core-modules': ['electron'],
  },
};
