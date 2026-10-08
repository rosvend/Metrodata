import { expect, it } from "vitest";
import type { AccessSummary, IsochroneStats, KpiReport, LineKpis, SpikesJson } from "../data/types";
import { demoFacts } from "./facts";

const lineA = {
  line_share: 0.6488,
  avg_weekday_boardings: 683405,
  peak_hour_weekday: { hour: 17, share: 0.1119 },
  saturation_index: 1.056,
  daily_peak_median: 77000,
  daily_peak_p95: 81312,
} as LineKpis;

const kpis = {
  by_year: { "2026": { months: [], system: { peak_hour_weekday: { hour: 17, share: 0.1023 } }, lines: { A: lineA } } },
  day_type_peaks: {
    "2026": {
      weekday: {
        system: {},
        lines: {
          H: { operating_days: 1, peak_hour: { hour: 5, share: 0.2 }, peak_to_average_ratio: 3.6 },
          L: { operating_days: 1, peak_hour: { hour: 17, share: 0.12 }, peak_to_average_ratio: 1.12 },
        },
      },
    },
  },
  like_for_like_growth: {
    "2025": { vs: 2024, system: 0.022, lines: {} },
    "2026": { vs: 2025, system: -0.04, lines: {} },
  },
} as unknown as KpiReport;

const spikes = {
  dates: ["2024-12-22", "2026-06-21", "2025-01-01"],
  spike_index: [35.06, -64.81, null],
  driver: ["christmas", "election", "holiday"],
  holiday: [null, null, "New Year's Day"],
  holiday_es: [null, null, "Año Nuevo"],
} as unknown as SpikesJson;

const access = {
  fully_inside_threshold: 0.99,
  filters: { all: { medellin_urban_share_15: 0.4847, barrios: [{ share: 1 }, { share: 0.995 }, { share: 0.5 }] } },
} as unknown as AccessSummary;

const iso = { stations: [{ station_id: "poblado", area_15_km2: 2.7 }] } as unknown as IsochroneStats;

it("derives every narrated number from the data", () => {
  const f = demoFacts(kpis, spikes, access, iso);
  expect(f.lineAShare).toBe(0.6488);
  expect(f.lineAP95AboveMedian).toBeCloseTo(0.056, 3);
  expect(f.cablePeakHour).toBe(5);
  expect(f.topSpike).toEqual({
    date: "2024-12-22",
    value: 35.06,
    driver: "christmas",
    holiday: null,
    holiday_es: null,
  });
  expect(f.topDip).toMatchObject({ date: "2026-06-21", value: -64.81, driver: "election" });
  expect(f.barriosFully).toBe(2);
  expect(f.pobladoArea15).toBe(2.7);
  expect(f.growth2026).toBe(-0.04);
});
