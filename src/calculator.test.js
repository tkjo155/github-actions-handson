const { add, subtract, multiply } = require('./calculator');

test('足し算が正しく動く', () => {
  expect(add(2, 3)).toBe(5);
});

test('引き算が正しく動く', () => {
  expect(subtract(5, 3)).toBe(2);
});

test('掛け算が正しく動く', () => {
  expect(multiply(3, 4)).toBe(12);
});