import { describe, expect, it } from "vitest";
import { LINES, LINE_IDS, contrastRatio, hexToRgb, lineInfo } from "./lines";

describe("lines", () => {
  it("covers the 12 ridership lines in official order", () => {
    expect(LINE_IDS).toEqual(["A", "B", "T-A", "H", "J", "K", "L", "M", "P", "1", "2", "O"]);
  });

  it("uses the official Metro de Medellín colors", () => {
    expect(lineInfo("A").color).toBe("#215ca0");
    expect(lineInfo("T-A").badge).toBe("T");
  });

  it("picks the badge text color with the higher contrast", () => {
    for (const l of LINES) expect(contrastRatio(l.color, l.text)).toBeGreaterThanOrEqual(3);
    expect(lineInfo("J").text).toBe("#111716");
    expect(lineInfo("A").text).toBe("#ffffff");
  });

  it("converts hex to rgb", () => {
    expect(hexToRgb("#215ca0")).toEqual([33, 92, 160]);
  });
});
