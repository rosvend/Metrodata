import { describe, expect, it } from "vitest";
import type { DailyTotals, SpikesJson } from "../data/types";
import { calendarCells, hourlyYoY, monthlyYoY, rankDays } from "./shape";

const spikes: SpikesJson = {
  lines_used: [],
  window_days: 35,
  min_comparables: 2,
  dates: ["2024-01-01", "2024-01-02", "2024-12-22", "2025-01-01"],
  day_type: ["sunday_holiday", "weekday", "sunday_holiday", "sunday_holiday"],
  holiday: ["New Year's Day", null, null, "New Year's Day"],
  holiday_es: ["Año Nuevo", null, null, "Año Nuevo"],
  actual: [100, 200, 300, 120],
  expected: [null, 190, 222, 130],
  n_comparables: [1, 4, 10, 3],
  spike_index: [null, 5.26, 35.06, -7.69],
  driver: ["holiday", "none", "christmas", "holiday"],
  driver_label: ["Public holiday: New Year's Day", "No obvious driver", "Christmas lights season", "Public holiday"],
};

const daily = {
  dates: ["2024-01-01", "2024-01-02", "2024-02-20", "2024-12-22"],
  excluded: [false, false, true, false],
  system: [1, 2, 6570, 4],
} as unknown as DailyTotals;

describe("calendarCells", () => {
  const cells = calendarCells(spikes, daily, 2024, ["2024-01-01", "2024-12-31"]);
  it("has one cell per calendar day with Monday-first weekday rows", () => {
    expect(cells).toHaveLength(366);
    const jan1 = cells[0];
    expect(jan1?.dow).toBe(0); // 2024-01-01 was a Monday
    expect(jan1?.week).toBe(0);
  });
  it("marks excluded, missing and insufficient-baseline days", () => {
    const by = new Map(cells.map((c) => [c.date, c]));
    expect(by.get("2024-02-20")?.status).toBe("excluded");
    expect(by.get("2024-01-15")?.status).toBe("missing");
    expect(by.get("2024-01-01")?.status).toBe("no_baseline");
    expect(by.get("2024-12-22")?.status).toBe("ok");
    expect(by.get("2024-12-22")?.value).toBe(35.06);
  });
});

describe("rankDays", () => {
  it("returns top spikes and dips for one year", () => {
    const r = rankDays(spikes, 2024, 5);
    expect(r.spikes.map((d) => d.date)).toEqual(["2024-12-22", "2024-01-02"]);
    expect(r.dips).toEqual([]);
    expect(rankDays(spikes, 2025, 5).dips.map((d) => d.date)).toEqual(["2025-01-01"]);
  });
});

describe("monthlyYoY", () => {
  it("lists Jan–Jul months with each year's mean daily boardings", () => {
    const monthly = {
      "2024-01": { days: 30, system: 800, lines: {} },
      "2025-01": { days: 31, system: 820, lines: {} },
      "2026-01": { days: 31, system: 790, lines: {} },
      "2025-08": { days: 31, system: 999, lines: {} },
    };
    const rows = monthlyYoY(monthly);
    expect(rows.map((r) => r.month)).toEqual([1]);
    expect(rows[0]).toEqual({ month: 1, values: { 2024: 800, 2025: 820, 2026: 790 } });
  });
});

describe("hourlyYoY", () => {
  it("computes the change per hour band", () => {
    const rows = hourlyYoY([100, 200], [110, 150]);
    expect(rows[0]).toMatchObject({ hour: 4, before: 100, after: 110 });
    expect(rows[0]?.change).toBeCloseTo(0.1);
    expect(rows[1]?.change).toBeCloseTo(-0.25);
  });
});
