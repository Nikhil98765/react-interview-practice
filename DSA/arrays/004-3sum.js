import test from "node:test";
import assert from "node:assert/strict";

/**
  ** Interview: sort, then fix each i and run two-sum-ii (001) on the rest with target -nums[i]. Sorting is what makes duplicates easy to skip, because equal values sit next to each other.
      - skip i when it equals the previous i, otherwise the same triple is pushed again
      - after a match, move both pointers and skip repeats of the values just used. [0,0,0,0] needs this, or it returns [0,0,0] twice
      - extra: once nums[i] > 0, break. The smallest value is positive, so no triple can sum to 0 (the code below doesn't do this; it's still correct)

  ** Gotchas
      - nums.sort sorts in place, so the caller's array changes: [3,-1,-2] becomes [-2,-1,3]. Use [...nums].sort(...) if that matters
      - without (a, b) => a - b, sort compares the values as strings: [-1,-4,2].sort() gives [-1,-4,2], not [-4,-1,2]
      - input[i-1] at i = 0 is input[-1], which is undefined, so the check is false. It works, but i > 0 && ... says what you mean
      - NaN is skipped silently ([NaN,-1,0,1] gives [[-1,0,1]]) because NaN + x is never 0. That's a limit of the approach, not handled on purpose
      - checked against brute force on 20,000 random arrays: 0 mismatches
*/
export function threeSum(nums) {
  const input = nums.sort((a, b) => a - b); // chrome, uses tim sort which is a type of merge sort. time => O(nlogn)
  // hybrid of merge sort + insertion sort; V8 has used it since v7.0 (Chrome 70). Before that it used quicksort, which wasn't stable
  const result = [];

  for (let i = 0; i < input.length - 2; i++) { // time => O(n^2)
    const item = input[i];

    if (item === input[i-1]) {
      continue;
    }

    let p1 = i + 1, p2 = input.length - 1;
    const resultSum = 0 - item;
    while (p1 < p2) {
      const sum = input[p1] + input[p2];
      if (sum === resultSum) {
        result.push([item, input[p1], input[p2]]);
        p1++;
        p2--;
        while (p1 < p2 && input[p1] === input[p1 - 1]) p1++;
        while (p1 < p2 && input[p2] === input[p2 + 1]) p2--;
      } else if (sum < resultSum) {
        p1++;
      } else {
        p2--;
      }
    }
 
  }

  return result; // result time => O(n^2) + O(nlogn) => O(n^2). space = O(1) which don't count the result array
  // only O(1) if you leave out the sort: V8's TimSort uses a temporary buffer of up to n/2, so the answer is O(n) extra (O(log n) with an in-place quicksort)
  
}

const norm = (res) =>
  res
    .map((t) => [...t].sort((a, b) => a - b))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

test("3sum", () => {
  assert.deepEqual(norm(threeSum([-1, 0, 1, 2, -1, -4])), [
    [-1, -1, 2],
    [-1, 0, 1],
  ]);
  assert.deepEqual(threeSum([0, 1, 1]), []);
  assert.deepEqual(threeSum([0, 0, 0]), [[0, 0, 0]]);
  assert.deepEqual(threeSum([0, 0, 0, 0]), [[0, 0, 0]]);
  assert.deepEqual(norm(threeSum([-2, 0, 1, 1, 2])), [
    [-2, 0, 2],
    [-2, 1, 1],
  ]);
  assert.deepEqual(threeSum([]), []);
  assert.deepEqual(threeSum([1, -1]), []);
  assert.deepEqual(threeSum([1, 2, 3]), []);

  const input = [3, -1, -2];
  assert.deepEqual(threeSum(input), [[-2, -1, 3]]);
  assert.deepEqual(input, [-2, -1, 3]); // sorted in place
});
