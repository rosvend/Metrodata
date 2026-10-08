import type { Theme } from "../lib/theme";
import { FilterControls } from "./FilterControls";
import { MainNav } from "./MainNav";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenAbout: () => void;
}

export function TopBar({ theme, onToggleTheme, onOpenAbout }: Props) {
  return (
    <header className="z-20 border-b border-rule bg-bg/95 backdrop-blur sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-10 gap-y-3 px-4 py-3 sm:px-8">
        <a href="/" className="order-1 flex items-center gap-3" aria-label="Metrodata home">
          <img src="/Metro_Medellín_Logo.svg" alt="" className="size-12 rounded-[4px]" />
          <span className="leading-tight">
            <span className="block text-[20px] font-semibold tracking-[-0.01em] text-ink">Metrodata</span>
            <span className="block text-[13px] font-light text-ink-muted">Ridership intelligence</span>
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
            onClick={onOpenAbout}
            className="rounded-full px-4 py-2 text-[15px] font-normal text-ink ring-1 ring-ink/70 hover:bg-soft"
          >
            <span className="sm:hidden">About</span>
            <span className="hidden sm:inline">About the data</span>
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
