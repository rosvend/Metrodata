import { describe, expect, it } from "vitest";
import { resolveTheme, toggleTheme } from "./theme";

describe("resolveTheme", () => {
  it("prefers a stored choice", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("falls back to the system preference", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme("purple", false)).toBe("light");
  });
});

it("toggleTheme flips", () => {
  expect(toggleTheme("light")).toBe("dark");
  expect(toggleTheme("dark")).toBe("light");
});
