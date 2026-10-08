import { formatCompact, formatInt, formatPercent } from "../lib/format";
import type { Metric } from "./metrics";

export function describeValue(metric: Metric, v: number): string {
  if (metric === "share") return `${formatPercent(v)} of the line's daily boardings`;
  if (metric === "per_km") return `${formatInt(v)} boardings per km`;
  return `${formatInt(v)} boardings`;
}

export function compactValue(metric: Metric, v: number): string {
  if (metric === "share") return formatPercent(v);
  return formatCompact(v);
}
