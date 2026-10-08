import { describe, expect, it } from "vitest";
import { FIRST_HOUR, SECONDS_PER_HOUR, advance } from "./playback";

describe("advance", () => {
  it("moves one hour per SECONDS_PER_HOUR at 1x", () => {
    expect(advance(8, SECONDS_PER_HOUR * 1000, 1)).toBeCloseTo(9);
    expect(advance(8, SECONDS_PER_HOUR * 1000, 4)).toBeCloseTo(12);
  });
  it("wraps from the end of service back to 04:00", () => {
    expect(advance(23.9, SECONDS_PER_HOUR * 200, 1)).toBeCloseTo(FIRST_HOUR + 0.1);
  });
});
