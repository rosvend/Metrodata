import { createContext, useContext } from "react";
import type { Theme } from "../lib/theme";

export const ThemeContext = createContext<Theme>("light");

export const useCurrentTheme = (): Theme => useContext(ThemeContext);
