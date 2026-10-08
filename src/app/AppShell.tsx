import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Outlet } from "react-router";
import { AboutDrawer } from "./AboutDrawer";
import { ThemeContext } from "./themeContext";
import { TopBar } from "./TopBar";
import { useTheme } from "./useTheme";

export function AppShell() {
  const [theme, toggleTheme] = useTheme();
  const [aboutOpen, setAboutOpen] = useState(false);
  return (
    <ThemeContext value={theme}>
      <MotionConfig reducedMotion="user">
        <a
          href="#main"
          className="sr-only z-30 rounded-full bg-green px-4 py-2 font-semibold text-metro-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <TopBar theme={theme} onToggleTheme={toggleTheme} onOpenAbout={() => setAboutOpen(true)} />
        <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
        <AboutDrawer open={aboutOpen} onClose={() => setAboutOpen(false)} />
      </MotionConfig>
    </ThemeContext>
  );
}
