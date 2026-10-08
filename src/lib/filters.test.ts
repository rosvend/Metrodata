import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, parseFilters, withFilters } from "./filters";

describe("parseFilters", () => {
  it("reads valid year and day type", () => {
    expect(parseFilters(new URLSearchParams("year=2024&day=saturday"))).toEqual({ year: 2024, dayType: "saturday" });
  });

  it("falls back to defaults for missing or invalid values", () => {
    expect(parseFilters(new URLSearchParams(""))).toEqual(DEFAULT_FILTERS);
    expect(parseFilters(new URLSearchParams("year=1999&day=holiday"))).toEqual(DEFAULT_FILTERS);
  });
});

describe("withFilters", () => {
  it("updates one filter and keeps unrelated params", () => {
    const next = withFilters(new URLSearchParams("year=2024&date=2024-12-22"), { dayType: "sunday_holiday" });
    expect(next.get("year")).toBe("2024");
    expect(next.get("day")).toBe("sunday_holiday");
    expect(next.get("date")).toBe("2024-12-22");
  });
});
