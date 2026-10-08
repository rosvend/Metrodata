import { describe, expect, it } from "vitest";
import type { LineKpis, PeaksJson } from "../data/types";
import { heatmapCells, loadRanking, peaksByYear } from "./shape";

const series = (f: (h: number) => number) => Array.from({ length: 20 }, (_, i) => f(i + 4));

describe("heatmapCells", () => {
  const byLine = { system: series(() => 1), A: series((h) => (h === 17 ? 30 : 10)), L: series(() => 1) };
  it("normalizes each line by its own daily total in share mode", () => {
    const cells = heatmapCells(byLine, "share", ["A", "L"]);
    const a17 = cells.find((c) => c.line === "A" && c.hour === 17);
    expect(a17?.value).toBeCloseTo(30 / (19 * 10 + 30));
    expect(cells.filter((c) => c.line === "L").every((c) => Math.abs(c.value - 0.05) < 1e-9)).toBe(true);
  });
  it("keeps raw boardings in absolute mode and skips the system row", () => {
    const cells = heatmapCells(byLine, "absolute", ["A", "L"]);
    expect(cells).toHaveLength(40);
    expect(cells.find((c) => c.line === "A" && c.hour === 17)?.value).toBe(30);
  });
});

describe("loadRanking", () => {
  const kpi = (v: number, indicative: boolean) =>
    ({ peak_hour_load_per_km: v, length_indicative: indicative }) as LineKpis;
  it("sorts lines by peak-hour boardings per km and keeps the indicative flag", () => {
    expect(loadRanking({ A: kpi(3158, false), O: kpi(54, true), B: kpi(1810, false) })).toEqual([
      { line: "A", value: 3158, indicative: false },
      { line: "B", value: 1810, indicative: false },
      { line: "O", value: 54, indicative: true },
    ]);
  });
});

describe("peaksByYear", () => {
  it("splits a line's weekday daily peaks by year", () => {
    const peaks: PeaksJson = {
      day_type: "weekday",
      lines: { A: { dates: ["2024-01-02", "2025-01-02", "2025-01-03"], peak: [80, 85, 86], hour: [17, 17, 6] } },
    };
    expect(peaksByYear(peaks, "A")).toEqual([
      { year: 2024, date: "2024-01-02", peak: 80, hour: 17 },
      { year: 2025, date: "2025-01-02", peak: 85, hour: 17 },
      { year: 2025, date: "2025-01-03", peak: 86, hour: 6 },
    ]);
  });
});
