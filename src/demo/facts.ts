import type { AccessSummary, IsochroneStats, KpiReport, SpikesJson } from "../data/types";

// Driver is a key (translated in the UI); holiday names come in both languages
export interface Extreme {
  date: string;
  value: number;
  driver: string;
  holiday: string | null;
  holiday_es: string | null;
}

export interface DemoFacts {
  lineAShare: number;
  lineAWeekday: number;
  lineAPeakHour: number;
  lineAPeakShare: number;
  lineASaturation: number;
  lineAP95AboveMedian: number;
  systemPeakHour: number;
  systemPeakShare: number;
  cablePeakHour: number;
  arviPeakToAverage: number;
  topSpike: Extreme;
  topDip: Extreme;
  growth2026: number;
  growth2025: number;
  pobladoArea15: number;
  urbanShare15: number;
  barriosFully: number;
  barriosTotal: number;
}

const YEAR = "2026";

function extreme(spikes: SpikesJson, sign: 1 | -1): Extreme {
  let best = -1;
  spikes.spike_index.forEach((v, i) => {
    if (v === null) return;
    const cur = best < 0 ? null : spikes.spike_index[best];
    if (cur === null || cur === undefined || v * sign > cur * sign) best = i;
  });
  return {
    date: spikes.dates[best] ?? "",
    value: spikes.spike_index[best] ?? 0,
    driver: spikes.driver[best] ?? "none",
    holiday: spikes.holiday[best] ?? null,
    holiday_es: spikes.holiday_es[best] ?? null,
  };
}

// Every number the demo narrates is read from the generated data, never typed into captions
export function demoFacts(k: KpiReport, spikes: SpikesJson, access: AccessSummary, iso: IsochroneStats): DemoFacts {
  const year = k.by_year[YEAR];
  const a = year?.lines.A;
  const weekday = k.day_type_peaks[YEAR]?.weekday;
  const all = access.filters.all;
  if (!year || !a || !weekday) throw new Error(`KPIs for ${YEAR} are missing`);
  return {
    lineAShare: a.line_share,
    lineAWeekday: a.avg_weekday_boardings,
    lineAPeakHour: a.peak_hour_weekday.hour,
    lineAPeakShare: a.peak_hour_weekday.share,
    lineASaturation: a.saturation_index,
    lineAP95AboveMedian: a.daily_peak_p95 / a.daily_peak_median - 1,
    systemPeakHour: year.system.peak_hour_weekday.hour,
    systemPeakShare: year.system.peak_hour_weekday.share,
    cablePeakHour: weekday.lines.H?.peak_hour.hour ?? 0,
    arviPeakToAverage: weekday.lines.L?.peak_to_average_ratio ?? 0,
    topSpike: extreme(spikes, 1),
    topDip: extreme(spikes, -1),
    growth2026: k.like_for_like_growth["2026"]?.system ?? 0,
    growth2025: k.like_for_like_growth["2025"]?.system ?? 0,
    pobladoArea15: iso.stations.find((s) => s.station_id === "poblado")?.area_15_km2 ?? 0,
    urbanShare15: all.medellin_urban_share_15,
    barriosFully: all.barrios.filter((b) => b.share >= access.fully_inside_threshold).length,
    barriosTotal: all.barrios.length,
  };
}
