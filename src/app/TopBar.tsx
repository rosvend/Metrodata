import type { Theme } from "../lib/theme";
import { FilterControls } from "./FilterControls";
import { LineNav } from "./LineNav";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenAbout: () => void;
}

export function TopBar({ theme, onToggleTheme, onOpenAbout }: Props) {
  return (
    <header
      data-surface="bar"
      className="z-20 bg-bar text-bar-ink shadow-[0_1px_0_rgba(255,255,255,0.06)] sm:sticky sm:top-0"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
        <a href="/" className="order-1 font-serif text-[1.35rem] leading-none font-bold tracking-tight text-bar-ink">
          Metrodata
          <span className="mt-1 block font-sans text-[11px] font-normal tracking-normal text-bar-muted">
            Metro de Medellín ridership
          </span>
        </a>
        <div className="order-3 w-full sm:w-auto lg:order-2">
          <LineNav />
        </div>
        <div className="order-4 w-full lg:order-3 lg:ml-auto lg:w-auto">
          <FilterControls />
        </div>
        <div className="order-2 ml-auto flex items-center gap-2 lg:order-4 lg:ml-0">
          <button
            type="button"
            onClick={onOpenAbout}
            className="rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 ring-white/15 hover:bg-white/10"
          >
            About the data
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
