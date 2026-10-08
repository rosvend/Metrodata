import type { LineKpis, PeaksJson } from "../data/types";
import { LINE_IDS } from "../lib/lines";

export type HeatMode = "share" | "absolute";

export interface Cell {
  line: string;
  hour: number;
  value: number;
  raw: number;
}

// Line x hour cells; share mode divides by the line's own mean daily boardings
export function heatmapCells(byLine: Record<string, number[]>, mode: HeatMode, lines: string[] = LINE_IDS): Cell[] {
  return lines.flatMap((line) => {
    const values = byLine[line] ?? [];
    const daily = values.reduce((s, v) => s + v, 0);
    return values.map((raw, i) => ({
      line,
      hour: i + 4,
      raw,
      value: mode === "share" ? (daily > 0 ? raw / daily : 0) : raw,
    }));
  });
}

export function loadRanking(lines: Record<string, LineKpis>) {
  return Object.entries(lines)
    .map(([line, k]) => ({ line, value: k.peak_hour_load_per_km, indicative: k.length_indicative }))
    .sort((a, b) => b.value - a.value);
}

export function peaksByYear(peaks: PeaksJson, line: string) {
  const l = peaks.lines[line];
  if (!l) return [];
  return l.dates.map((date, i) => ({
    year: Number(date.slice(0, 4)),
    date,
    peak: l.peak[i] ?? 0,
    hour: l.hour[i] ?? 0,
  }));
}
