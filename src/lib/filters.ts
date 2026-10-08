export const YEARS = [2024, 2025, 2026] as const;
export type Year = (typeof YEARS)[number];

export const DAY_TYPES = ["weekday", "saturday", "sunday_holiday"] as const;
export type DayType = (typeof DAY_TYPES)[number];

export interface Filters {
  year: Year;
  dayType: DayType;
}

export const DEFAULT_FILTERS: Filters = { year: 2026, dayType: "weekday" };

const isYear = (v: number): v is Year => (YEARS as readonly number[]).includes(v);
const isDayType = (v: string): v is DayType => (DAY_TYPES as readonly string[]).includes(v);

export function parseFilters(params: URLSearchParams): Filters {
  const year = Number(params.get("year"));
  const day = params.get("day") ?? "";
  return {
    year: isYear(year) ? year : DEFAULT_FILTERS.year,
    dayType: isDayType(day) ? day : DEFAULT_FILTERS.dayType,
  };
}

export function withFilters(params: URLSearchParams, patch: Partial<Filters>): URLSearchParams {
  const next = new URLSearchParams(params);
  if (patch.year !== undefined) next.set("year", String(patch.year));
  if (patch.dayType !== undefined) next.set("day", patch.dayType);
  return next;
}
