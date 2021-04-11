module.exports = {
  env: {
    node: true,
    "jest/globals": true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  ignorePatterns: ["webpack.config.js"],
  rules: {
    // "@typescript-eslint/no-explicit-any": "off",
    // "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};
