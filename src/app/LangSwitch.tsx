import { type Lang, useLang, useT } from "../i18n/lang";

const LANGS: Lang[] = ["es", "en"];

// "ES | EN" switch, as in the header of metrodemedellin.gov.co
export function LangSwitch() {
  const { lang, setLang } = useLang();
  const t = useT();
  return (
    <div role="group" aria-label={t.shell.language} className="flex items-center text-[14px]">
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span aria-hidden className="px-1 text-ink-faint">
              |
            </span>
          )}
          <button
            type="button"
            lang={l}
            aria-pressed={lang === l}
            onClick={() => setLang(l)}
            className={`rounded px-1 uppercase ${lang === l ? "font-semibold text-ink underline decoration-green decoration-2 underline-offset-4" : "text-ink-muted hover:text-ink"}`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
