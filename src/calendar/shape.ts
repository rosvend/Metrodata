import type { DailyTotals, MonthlyEntry, SpikesJson } from "../data/types";

export type CellStatus = "ok" | "no_baseline" | "excluded" | "missing";

export interface DayCell {
  date: string;
  week: number;
  dow: number;
  month: number;
  status: CellStatus;
  value: number | null;
  index: number;
}

const DAY_MS = 86_400_000;
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

// One cell per date in [from, to]; columns are weeks (Monday-first), rows are weekdays
export function calendarCells(
  spikes: SpikesJson,
  daily: DailyTotals,
  year: number,
  [from, to]: [string, string],
): DayCell[] {
  const spikeIdx = new Map(spikes.dates.map((d, i) => [d, i]));
  const excluded = new Set(daily.dates.filter((_, i) => daily.excluded[i]));
  const known = new Set(daily.dates);
  const jan1 = utc(`${year}-01-01`);
  const offset = (jan1.getUTCDay() + 6) % 7;
  const cells: DayCell[] = [];
  for (let t = utc(from).getTime(); t <= utc(to).getTime(); t += DAY_MS) {
    const d = new Date(t);
    const date = iso(d);
    const i = spikeIdx.get(date) ?? -1;
    const value = i >= 0 ? (spikes.spike_index[i] ?? null) : null;
    const status: CellStatus = excluded.has(date)
      ? "excluded"
      : !known.has(date)
        ? "missing"
        : value === null
          ? "no_baseline"
          : "ok";
    const dayOfYear = Math.round((t - jan1.getTime()) / DAY_MS);
    cells.push({
      date,
      week: Math.floor((dayOfYear + offset) / 7),
      dow: (d.getUTCDay() + 6) % 7,
      month: d.getUTCMonth() + 1,
      status,
      value,
      index: i,
    });
  }
  return cells;
}

export interface RankedDay {
  date: string;
  index: number;
  value: number;
}

export function rankDays(spikes: SpikesJson, year: number, n: number): { spikes: RankedDay[]; dips: RankedDay[] } {
  const prefix = String(year);
  const days: RankedDay[] = spikes.dates.flatMap((date, index) => {
    const value = spikes.spike_index[index];
    return date.startsWith(prefix) && value !== null && value !== undefined ? [{ date, index, value }] : [];
  });
  return {
    spikes: days
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, n),
    dips: days
      .filter((d) => d.value < 0)
      .sort((a, b) => a.value - b.value)
      .slice(0, n),
  };
}

export const JAN_JUL = [1, 2, 3, 4, 5, 6, 7];

// Like-for-like months only: Q4 2025 does not exist and 2026 ends in July
export function monthlyYoY(monthly: Record<string, MonthlyEntry>) {
  const rows = JAN_JUL.map((month) => {
    const values: Record<number, number> = {};
    for (const [key, entry] of Object.entries(monthly)) {
      if (Number(key.slice(5)) === month) values[Number(key.slice(0, 4))] = entry.system;
    }
    return { month, values };
  });
  return rows.filter((r) => Object.keys(r.values).length > 0);
}

export function hourlyYoY(before: number[], after: number[]) {
  return before.map((b, i) => {
    const a = after[i] ?? 0;
    return { hour: i + 4, before: b, after: a, change: b > 0 ? a / b - 1 : 0 };
  });
}
