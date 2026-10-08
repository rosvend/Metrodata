import { describe, expect, it } from "vitest";
import { formatCompact, formatInt, formatPercent } from "./format";

describe("format", () => {
  it("formats integers with grouping", () => {
    expect(formatInt(185914886)).toBe("185,914,886");
  });

  it("formats compact numbers", () => {
    expect(formatCompact(683405)).toBe("683.4K");
    expect(formatCompact(1052491)).toBe("1.05M");
  });

  it("formats shares as percent", () => {
    expect(formatPercent(0.6488)).toBe("64.9%");
    expect(formatPercent(-0.0404, { signed: true })).toBe("−4.0%");
    expect(formatPercent(0.0222, { signed: true })).toBe("+2.2%");
  });
});
