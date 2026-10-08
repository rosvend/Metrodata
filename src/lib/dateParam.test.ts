import { expect, it } from "vitest";
import { dateForYear, parseDate, withDate } from "./dateParam";

it("reads only well-formed dates", () => {
  expect(parseDate(new URLSearchParams("date=2024-12-22"))).toBe("2024-12-22");
  expect(parseDate(new URLSearchParams("date=yesterday"))).toBeNull();
});

it("sets the date and keeps the year filter in step", () => {
  const next = withDate(new URLSearchParams("year=2026&day=saturday"), "2024-12-22");
  expect(next.get("date")).toBe("2024-12-22");
  expect(next.get("year")).toBe("2024");
  expect(next.get("day")).toBe("saturday");
});

it("ignores a date from a different year than the active filter", () => {
  expect(dateForYear("2024-12-22", 2024)).toBe("2024-12-22");
  expect(dateForYear("2024-12-22", 2026)).toBeNull();
  expect(dateForYear(null, 2026)).toBeNull();
});
