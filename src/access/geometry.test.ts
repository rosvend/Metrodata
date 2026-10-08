import { describe, expect, it } from "vitest";
import type { AreaGeometry, IsochronesGeo } from "../data/types";
import { pointInGeometry, scaleAround, walkingTime } from "./geometry";

const square = (x0: number, y0: number, s: number): [number, number][] => [
  [x0, y0],
  [x0 + s, y0],
  [x0 + s, y0 + s],
  [x0, y0 + s],
  [x0, y0],
];

describe("pointInGeometry", () => {
  const withHole: AreaGeometry = { type: "Polygon", coordinates: [square(0, 0, 10), square(4, 4, 2)] };
  it("handles holes", () => {
    expect(pointInGeometry([1, 1], withHole)).toBe(true);
    expect(pointInGeometry([5, 5], withHole)).toBe(false);
    expect(pointInGeometry([11, 1], withHole)).toBe(false);
  });
  it("handles multipolygons", () => {
    const multi: AreaGeometry = { type: "MultiPolygon", coordinates: [[square(0, 0, 1)], [square(5, 5, 1)]] };
    expect(pointInGeometry([5.5, 5.5], multi)).toBe(true);
    expect(pointInGeometry([3, 3], multi)).toBe(false);
  });
});

describe("walkingTime", () => {
  const iso: IsochronesGeo = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { station_id: "a", name: "A", minutes: 5, area_km2: 1 },
        geometry: { type: "Polygon", coordinates: [square(0, 0, 2)] },
      },
      {
        type: "Feature",
        properties: { station_id: "a", name: "A", minutes: 15, area_km2: 9 },
        geometry: { type: "Polygon", coordinates: [square(-5, -5, 12)] },
      },
      {
        type: "Feature",
        properties: { station_id: "b", name: "B", minutes: 10, area_km2: 4 },
        geometry: { type: "Polygon", coordinates: [square(3, 3, 3)] },
      },
    ],
  };
  it("returns the smallest contour containing the point and its station", () => {
    expect(walkingTime([1, 1], iso)).toEqual({ minutes: 5, station_id: "a", name: "A" });
    expect(walkingTime([4, 4], iso)).toEqual({ minutes: 10, station_id: "b", name: "B" });
    expect(walkingTime([-4, -4], iso)).toEqual({ minutes: 15, station_id: "a", name: "A" });
  });
  it("returns null outside every contour or for excluded stations", () => {
    expect(walkingTime([50, 50], iso)).toBeNull();
    expect(walkingTime([1, 1], iso, new Set(["b"]))).toBeNull();
  });
});

it("scaleAround shrinks rings toward the origin", () => {
  const g: AreaGeometry = { type: "Polygon", coordinates: [square(0, 0, 2)] };
  const half = scaleAround(g, [0, 0], 0.5);
  expect(half.type === "Polygon" && half.coordinates[0]?.[2]).toEqual([1, 1]);
});
