import { createContext, useContext } from "react";
import { type Messages, en } from "./en";
import { es } from "./es";

export type Lang = "es" | "en";

export const MESSAGES: Record<Lang, Messages> = { es, en };

// Spanish is the default: the dashboard is presented to a Colombian audience
export const DEFAULT_LANG: Lang = "es";
const STORAGE_KEY = "lang";

export const resolveLang = (stored: string | null): Lang =>
  stored === "en" || stored === "es" ? stored : DEFAULT_LANG;

export function readStoredLang(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this session
  }
}

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

export const useLang = () => useContext(LangContext);

export const useT = (): Messages => MESSAGES[useContext(LangContext).lang];
