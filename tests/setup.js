require('@testing-library/jest-dom');

// グローバルなfetch APIのモック
global.fetch = jest.fn();

// console のモック（テスト出力をクリーンに）
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};