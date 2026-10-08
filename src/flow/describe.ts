import type { Messages } from "../i18n/en";
import { formatCompact, formatInt, formatPercent } from "../lib/format";
import type { Metric } from "./metrics";

export function describeValue(t: Messages, metric: Metric, v: number): string {
  if (metric === "share") return t.flow.value.share(formatPercent(v));
  if (metric === "per_km") return t.flow.value.per_km(formatInt(v));
  return t.flow.value.boardings(formatInt(v));
}

export function compactValue(metric: Metric, v: number): string {
  if (metric === "share") return formatPercent(v);
  return formatCompact(v);
}
