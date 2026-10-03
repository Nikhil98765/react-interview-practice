import test from "node:test";
import assert from "node:assert/strict";

export function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const num1 = numbers[left];
    const num2 = numbers[right];
    const result = num1 + num2;
    if (result === target) {
      return [left + 1, right + 1];
    } else if (result > target) {
      right--;
    } else {
      left++;
    }
  }

  return [];
}

/**
  ** Interview: Since the number[left] is the smallest, even if smallest + number[right] is greater than target then number[right] + anything else will be too big. so, numbers[right] won't be a part of answer and i drop it.
*/

test("two sum ii", () => {
  assert.deepEqual(twoSum([2, 7, 11, 15], 9), [1, 2]);
  assert.deepEqual(twoSum([2, 3, 4], 6), [1, 3]);
  assert.deepEqual(twoSum([-1, 0], -1), [1, 2]);
  assert.deepEqual(twoSum([1, 2, 5], 4), []);
});
