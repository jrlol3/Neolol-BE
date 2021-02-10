module.exports = {
  "env": {
    "node": true,
    "es6": true,
    "mocha": true
  },
  "extends": [
    "airbnb-base",
    "prettier"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "func-names": "off",
    "array-callback-return": "off",
    "consistent-return": "off",
    "no-param-reassign": ["error", {"props": false}],
    "object-curly-spacing": ["error", "always"],
    "semi": ["error", "always"],
    "indent": ["error", 2],
    "no-console": 0,
    "comma-dangle": ["error", "always-multiline"],
    "max-classes-per-file": "off",
    "camelcase": "off", // having second thoughts
    "quotes": ['error', "double"],
    "quote-props": ['error', 'as-needed'],
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}]
  }
};
