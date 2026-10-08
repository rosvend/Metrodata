import type { Theme } from "../lib/theme";

type RGBA = [number, number, number, number];

// Walking-time bands in Metro greens: darker = closer
export const BAND_HEX: Record<number, string> = { 5: "#2f7a22", 10: "#65bc4b", 15: "#b9e2a8" };

export function bandFill(minutes: number, theme: Theme): RGBA {
  const alpha = theme === "dark" ? 150 : 135;
  if (minutes === 5) return [47, 122, 34, alpha + 30];
  if (minutes === 10) return [101, 188, 75, alpha];
  return [185, 226, 168, alpha];
}
