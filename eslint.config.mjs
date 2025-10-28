import js from "@eslint/js";
import globals from "globals";

export default [
  // 推奨設定を適用
  js.configs.recommended,

  // 全てのJSファイルに適用する設定
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-console": "warn",
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
    },
  },

  // テストファイルには特別な設定
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
