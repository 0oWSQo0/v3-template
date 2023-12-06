module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-essential', 'prettier', './.eslintrc-auto-import.json'],
  parserOptions: {
    'ecmaVersion': 'latest',
    'parser': '@typescript-eslint/parser',
    'sourceType': 'module'
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    "@typescript-eslint/no-explicit-any": ["off"],
    "vue/multi-word-component-names": 'off',
    'no-useless-escape': 'off'
  }
}
