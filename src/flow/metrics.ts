export type Metric = "boardings" | "per_km" | "share";

export const METRIC_LABELS: Record<Metric, string> = {
  boardings: "Boardings",
  per_km: "Per km",
  share: "Share of day",
};

const FIRST = 4;
const LAST = 23;
const MIN_WIDTH = 2;
const MAX_WIDTH = 26;
const MIN_OPACITY = 0.35;

// Hour bands are 04..23; t is a continuous hour of day in [4, 24)
export function interpolate(values: number[], t: number): number {
  const i = Math.min(Math.max(t, FIRST), LAST) - FIRST;
  const lo = Math.floor(i);
  const hi = Math.min(lo + 1, values.length - 1);
  const a = values[lo] ?? 0;
  const b = values[hi] ?? a;
  return a + (b - a) * (i - lo);
}

export function metricValue(raw: number, metric: Metric, line: { km: number; daily: number }): number {
  if (metric === "per_km") return raw / line.km;
  if (metric === "share") return line.daily > 0 ? raw / line.daily : 0;
  return raw;
}

export function metricMax(lines: { values: number[]; km: number }[], metric: Metric): number {
  let max = 0;
  for (const l of lines) {
    const daily = l.values.reduce((s, v) => s + v, 0);
    for (const v of l.values) max = Math.max(max, metricValue(v, metric, { km: l.km, daily }));
  }
  return max;
}

const ratio = (v: number, max: number) => (max > 0 ? Math.min(Math.max(v / max, 0), 1) : 0);

export const widthFor = (v: number, max: number): number =>
  MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * Math.sqrt(ratio(v, max));

export const opacityFor = (v: number, max: number): number =>
  MIN_OPACITY + (1 - MIN_OPACITY) * Math.sqrt(ratio(v, max));

export const particleCount = (v: number, max: number, cap: number): number => Math.round(cap * ratio(v, max));

const pad = (n: number) => String(n).padStart(2, "0");

export function hourBand(t: number): string {
  const h = Math.min(Math.floor(t), LAST);
  return `${pad(h)}:00–${pad(h)}:59`;
}
