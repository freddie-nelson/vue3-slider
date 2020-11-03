module.exports = {
  root: true,

  env: {
    node: true
  },

  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off'
  },

  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/prettier",
    "@vue/typescript"
  ],

  'extends': [
    'plugin:vue/strongly-recommended',
    'eslint:recommended',
    '@vue/prettier',
    '@vue/typescript'
  ]
};
