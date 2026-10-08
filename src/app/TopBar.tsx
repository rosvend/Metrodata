import { useDemo } from "../demo/useDemo";
import { useT } from "../i18n/lang";
import type { Theme } from "../lib/theme";
import { FilterControls } from "./FilterControls";
import { LangSwitch } from "./LangSwitch";
import { MainNav } from "./MainNav";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenAbout: () => void;
}

export function TopBar({ theme, onToggleTheme, onOpenAbout }: Props) {
  const demo = useDemo();
  const t = useT();
  return (
    <header className="z-20 border-b border-rule bg-bg/95 backdrop-blur sm:sticky sm:top-0 lg:static">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-8">
        <a href="/" className="order-1 flex items-center gap-3" aria-label={t.shell.home}>
          <img src="/Metro_Medellín_Logo.svg" alt="" className="size-12 rounded-[4px]" />
          <span className="leading-tight">
            <span className="block text-[20px] font-semibold tracking-[-0.01em] text-ink">Metrodata</span>
            <span className="block text-[13px] font-light text-ink-muted">{t.shell.tagline}</span>
          </span>
        </a>
        <div className="order-3 w-full sm:w-auto lg:order-2">
          <MainNav />
        </div>
        <div className="order-4 w-full lg:order-3 lg:ml-auto lg:w-auto">
          <FilterControls />
        </div>
        <div className="order-2 ml-auto flex items-center gap-2 lg:order-4 lg:ml-0">
          <button
            type="button"
            onClick={demo.index === null ? demo.start : demo.stop}
            className="rounded-full bg-green px-4 py-2 text-[15px] font-semibold text-metro-ink hover:brightness-95"
          >
            {demo.index === null ? t.shell.demo : t.shell.endDemo}
          </button>
          <button
            type="button"
            onClick={onOpenAbout}
            className="rounded-full px-4 py-2 text-[15px] font-normal text-ink ring-1 ring-ink/70 hover:bg-soft"
          >
            <span className="2xl:hidden">{t.shell.about}</span>
            <span className="hidden 2xl:inline">{t.shell.aboutLong}</span>
          </button>
          <LangSwitch />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
