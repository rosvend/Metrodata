import { describe, expect, it } from "vitest";
import { parseAccessView, parseFlowView, setParam } from "./viewParams";

describe("parseFlowView", () => {
  it("reads metric, hour, play and line with defaults", () => {
    expect(parseFlowView(new URLSearchParams(""))).toEqual({ metric: "boardings", hour: 17, play: false, line: null });
    expect(parseFlowView(new URLSearchParams("metric=share&hour=5&play=1&line=A"))).toEqual({
      metric: "share",
      hour: 5,
      play: true,
      line: "A",
    });
  });
  it("ignores invalid values", () => {
    expect(parseFlowView(new URLSearchParams("metric=x&hour=99&line=Z"))).toEqual({
      metric: "boardings",
      hour: 17,
      play: false,
      line: null,
    });
  });
});

describe("parseAccessView", () => {
  it("reads mode, filter and overlap", () => {
    expect(parseAccessView(new URLSearchParams(""))).toEqual({ mode: "station", filter: "all", overlap: false });
    expect(parseAccessView(new URLSearchParams("mode=coverage&filter=metro&overlap=1"))).toEqual({
      mode: "coverage",
      filter: "metro",
      overlap: true,
    });
  });
});

it("setParam sets or removes a key and keeps the rest", () => {
  const p = setParam(new URLSearchParams("year=2024&line=A"), "line", null);
  expect(p.toString()).toBe("year=2024");
  expect(setParam(p, "metric", "share").get("metric")).toBe("share");
});
