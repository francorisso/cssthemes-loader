module.exports = {
  "extends": "airbnb",
  "env": {
    "mocha": true,
    "node": true
  },
  "rules": {
    "no-cond-assign": ["error", "except-parens"],
    "no-use-before-define": "off",
    "no-restricted-syntax": "off",
    "func-names": "off",
    "prefer-arrow-callback": "off"
  },
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ],
};
