import test from "node:test";
import assert from "node:assert/strict";

/**
  ** Interview: the area is capped by the shorter bar. Moving the taller pointer inward makes the width smaller and can't raise the shorter height, so every other partner for the shorter bar is worse. The shorter bar has already had its best pairing, so drop it (move that pointer). On equal heights, dropping either side is safe.
*/
export function maxArea(height) {
  let p1 = 0, p2 = height.length - 1, result = 0;

  while (p1 < p2) {
    const distance = p2 - p1;
    let minHeight;

    if (height[p1] < height[p2]) {
      minHeight = height[p1];
      p1++;
    } else if (height[p1] > height[p2]) {
      minHeight = height[p2];
      p2--;
    } else {
      minHeight = height[p1];
      p1++;
    }

    const loopResult = minHeight * distance;
    result = result < loopResult ? loopResult : result;
  }

  return result;
}

test("container with most water", () => {
  assert.equal(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
  assert.equal(maxArea([1, 1]), 1);
  assert.equal(maxArea([4, 3, 2, 1, 4]), 16);
  assert.equal(maxArea([1, 2, 1]), 2);
  assert.equal(maxArea([2, 3, 4, 5, 18, 17, 6]), 17);
});
