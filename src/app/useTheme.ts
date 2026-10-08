import { useEffect, useState } from "react";
import { type Theme, readStoredTheme, resolveTheme, storeTheme, toggleTheme } from "../lib/theme";

const systemDark = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(readStoredTheme(), systemDark()));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () =>
    setTheme((t) => {
      const next = toggleTheme(t);
      storeTheme(next);
      return next;
    });
  return [theme, toggle];
}
