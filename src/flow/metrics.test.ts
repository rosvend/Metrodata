import { describe, expect, it } from "vitest";
import { hourBand, interpolate, metricMax, metricValue, opacityFor, particleCount, widthFor } from "./metrics";

const flat = (v: number) => Array.from({ length: 20 }, () => v);

describe("interpolate", () => {
  const values = flat(0).map((_, i) => i * 10); // h04 = 0, h05 = 10, ...
  it("returns the band value on whole hours", () => {
    expect(interpolate(values, 4)).toBe(0);
    expect(interpolate(values, 17)).toBe(130);
  });
  it("blends linearly between hours", () => {
    expect(interpolate(values, 17.25)).toBeCloseTo(132.5);
  });
  it("holds the last band through the final hour", () => {
    expect(interpolate(values, 23.9)).toBe(190);
  });
});

describe("metricValue", () => {
  it("returns raw boardings, per km, or share of the line's day", () => {
    expect(metricValue(500, "boardings", { km: 2, daily: 10000 })).toBe(500);
    expect(metricValue(500, "per_km", { km: 2, daily: 10000 })).toBe(250);
    expect(metricValue(500, "share", { km: 2, daily: 10000 })).toBeCloseTo(0.05);
  });
});

describe("metricMax", () => {
  it("takes the max over lines and hours so the scale is stable while playing", () => {
    const lines = [
      { values: [1, 5, 2], km: 1 },
      { values: [10, 2, 1], km: 10 },
    ];
    expect(metricMax(lines, "boardings")).toBe(10);
    expect(metricMax(lines, "per_km")).toBe(5);
    expect(metricMax(lines, "share")).toBeCloseTo(10 / 13);
  });
});

describe("scales", () => {
  it("widths grow with sqrt of the value within bounds", () => {
    expect(widthFor(0, 100)).toBe(2);
    expect(widthFor(100, 100)).toBe(26);
    expect(widthFor(25, 100)).toBeCloseTo(2 + 24 * 0.5);
  });
  it("opacity never drops below the floor", () => {
    expect(opacityFor(0, 100)).toBeCloseTo(0.35);
    expect(opacityFor(100, 100)).toBeCloseTo(1);
  });
  it("particle count is proportional to the value", () => {
    expect(particleCount(50, 100, 40)).toBe(20);
    expect(particleCount(0, 100, 40)).toBe(0);
  });
});

it("hourBand formats operating-hour bands", () => {
  expect(hourBand(4)).toBe("04:00–04:59");
  expect(hourBand(17.6)).toBe("17:00–17:59");
});
