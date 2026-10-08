import { useEffect, useMemo, useState } from "react";
import { setFormatLocale } from "../lib/format";
import { type Lang, LangContext, MESSAGES, readStoredLang, resolveLang, storeLang } from "./lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => resolveLang(readStoredLang()));
  // Formatting follows the language; set before children render so first paint is already localised
  setFormatLocale(MESSAGES[lang].locale);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang: (next: Lang) => {
        storeLang(next);
        setLangState(next);
      },
    }),
    [lang],
  );
  return <LangContext value={value}>{children}</LangContext>;
}
