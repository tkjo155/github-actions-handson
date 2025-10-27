const { add, subtract, multiply,divide } = require('./calculator');

test('足し算が正しく動く', () => {
  expect(add(2, 3)).toBe(5);
});

test('引き算が正しく動く', () => {
  expect(subtract(5, 3)).toBe(2);
});

test('掛け算が正しく動く', () => {
  expect(multiply(3, 4)).toBe(12);
});

test(`割り算が正しく動く`,()=> {
  expect(divide(10,2)).toBe(5);
});

test(`0で割るとエラーになる`,() => {
  expect(divide(10,0)).toTrow(`0で割ることはできません`)
});