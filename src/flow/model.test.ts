import { describe, expect, it } from "vitest";
import type { LinesGeo, Profiles } from "../data/types";
import { buildFlowLines } from "./model";

const hours = Array.from({ length: 20 }, (_, i) => i + 4);
const series = (v: number) => hours.map(() => v);

const profiles: Profiles = {
  hours,
  periods: {
    "2026": {
      weekday: { system: series(30), A: series(20), O: series(10) },
      saturday: { system: series(3), A: series(2), O: series(1) },
      sunday_holiday: { system: series(3), A: series(2), O: series(1) },
    },
  },
};

const geo: LinesGeo = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-75.5, 6.2],
          [-75.5, 6.3],
        ],
      },
      properties: { id: "A", name: "x", mode: "metro", km: 25.4, has_ridership: true, indicative: false, estado: [1] },
    },
    {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates: [
          [
            [-75.6, 6.2],
            [-75.6, 6.25],
          ],
          [
            [-75.6, 6.25],
            [-75.6, 6.3],
          ],
        ],
      },
      properties: {
        id: "O",
        name: "y",
        mode: "metroplus",
        km: 30.06,
        has_ridership: true,
        indicative: true,
        estado: [4, 5],
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-75.7, 6.3],
          [-75.71, 6.31],
        ],
      },
      properties: {
        id: "La Aldea",
        name: "Cable Palmitas",
        mode: "metrocable",
        km: 1.9,
        has_ridership: false,
        indicative: false,
        estado: [1],
      },
    },
  ],
};

describe("buildFlowLines", () => {
  const { flow, noData } = buildFlowLines(geo, profiles, "2026", "weekday");

  it("joins geometry with the selected period and day type", () => {
    const a = flow.find((l) => l.id === "A");
    expect(a?.values[0]).toBe(20);
    expect(a?.daily).toBe(400);
    expect(a?.km).toBe(25.4);
    expect(a?.info.color).toBe("#215ca0");
  });

  it("keeps multi-part geometry as separate paths and flags indicative lengths", () => {
    const o = flow.find((l) => l.id === "O");
    expect(o?.paths).toHaveLength(2);
    expect(o?.parts).toHaveLength(2);
    expect(o?.indicative).toBe(true);
  });

  it("marks lines whose source geometry is not in operation (estado 4/5) as planned", () => {
    expect(flow.find((l) => l.id === "O")?.planned).toBe(true);
    expect(flow.find((l) => l.id === "A")?.planned).toBe(false);
  });

  it("separates lines without ridership data", () => {
    expect(noData.map((f) => f.properties.id)).toEqual(["La Aldea"]);
    expect(flow.map((l) => l.id)).toEqual(["A", "O"]);
  });
});
