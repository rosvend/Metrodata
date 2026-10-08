import { describe, expect, it } from "vitest";
import { measure, pointAlong } from "./path";

describe("path", () => {
  const p = measure([
    [0, 0],
    [0, 1],
    [0, 3],
  ]);
  it("measures cumulative length", () => {
    expect(p.total).toBeGreaterThan(0);
    expect(p.cum).toHaveLength(3);
  });
  it("finds points at a fraction of the length", () => {
    expect(pointAlong(p, 0)).toEqual([0, 0]);
    expect(pointAlong(p, 1)).toEqual([0, 3]);
    const mid = pointAlong(p, 0.5);
    expect(mid[0]).toBeCloseTo(0);
    expect(mid[1]).toBeCloseTo(1.5, 2);
  });
});
