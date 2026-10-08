import { LINE_IDS } from "./lines";

// Page view state that lives in the URL, so views can be shared and the demo can drive them
const METRICS = ["boardings", "per_km", "share"] as const;
const MODES = ["station", "coverage"] as const;
const FILTERS = ["all", "metro", "tranvia", "metrocable"] as const;

const oneOf = <T extends string>(options: readonly T[], value: string | null, fallback: T): T =>
  (options as readonly string[]).includes(value ?? "") ? (value as T) : fallback;

export function parseFlowView(p: URLSearchParams) {
  const hour = Number(p.get("hour"));
  const line = p.get("line");
  return {
    metric: oneOf(METRICS, p.get("metric"), "boardings"),
    hour: Number.isInteger(hour) && hour >= 4 && hour <= 23 ? hour : 17,
    play: p.get("play") === "1",
    line: line && LINE_IDS.includes(line) ? line : null,
  };
}

export function parseAccessView(p: URLSearchParams) {
  return {
    mode: oneOf(MODES, p.get("mode"), "station"),
    filter: oneOf(FILTERS, p.get("filter"), "all"),
    overlap: p.get("overlap") === "1",
  };
}

export function setParam(p: URLSearchParams, key: string, value: string | null): URLSearchParams {
  const next = new URLSearchParams(p);
  if (value === null) next.delete(key);
  else next.set(key, value);
  return next;
}
