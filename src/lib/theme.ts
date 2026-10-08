export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

export const toggleTheme = (t: Theme): Theme => (t === "dark" ? "light" : "dark");

export function readStoredTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeTheme(t: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this session
  }
}
