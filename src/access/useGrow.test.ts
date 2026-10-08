import { expect, it } from "vitest";
import { contourScale } from "./useGrow";

it("staggers contours and finishes at full size", () => {
  expect(contourScale(0, 5)).toBe(0);
  expect(contourScale(0.25, 15)).toBe(0);
  expect(contourScale(0.3, 5)).toBeGreaterThan(contourScale(0.3, 10));
  for (const m of [5, 10, 15]) expect(contourScale(1, m)).toBe(1);
});
