import test from "node:test";
import assert from "node:assert/strict";

/**
  ** Interview
      p1 => write , index of the last unique value, everything from 0 to p1 is unique.
      p2 => read, scans every element once, looking for a value different from num[p1]
*/
export function removeDuplicates(nums) {
  // your code
  if (nums.length === 0) return 0; // without this, [] returned 1 (p1 + 1)
  let p1 = 0, p2 = 1;

  while (p2 < nums.length) {
    if (nums[p1] === nums[p2]) {
      p2++;
    } else {
      nums[p1 + 1] = nums[p2];
      p1++;
      p2++;
    }
  }

  return p1 + 1;
}

function check(nums, expected) {
  const k = removeDuplicates(nums);
  assert.equal(k, expected.length);
  assert.deepEqual(nums.slice(0, k), expected);
}

test("remove duplicates", () => {
  check([1, 1, 2], [1, 2]);
  check([0, 0, 1, 1, 1, 2, 2, 3, 3, 4], [0, 1, 2, 3, 4]);
  check([7], [7]);
  check([2, 2, 2, 2], [2]);
  check([1, 2, 3], [1, 2, 3]);
  check([], []);
});
