module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-console': 'off',
    'react/jsx-filename-extension': 'off',
    'no-use-before-define': 'off',
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'linebreak-style': 'off',
    'react/no-unused-state': 'off',
    'no-throw-literal': 'off',
  },
};
