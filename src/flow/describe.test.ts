import { describe, expect, it } from "vitest";
import { en } from "../i18n/en";
import { compactValue, describeValue } from "./describe";

describe("describeValue", () => {
  it("states units for each metric", () => {
    expect(describeValue(en, "boardings", 76492.4)).toBe("76,492 boardings");
    expect(describeValue(en, "per_km", 3012.2)).toBe("3,012 boardings per km");
    expect(describeValue(en, "share", 0.1119)).toBe("11.2% of the line's daily boardings");
  });
});

describe("compactValue", () => {
  it("is short enough for line badges", () => {
    expect(compactValue("boardings", 76492.4)).toBe("76.5K");
    expect(compactValue("per_km", 312.4)).toBe("312");
    expect(compactValue("share", 0.0912)).toBe("9.1%");
  });
});
