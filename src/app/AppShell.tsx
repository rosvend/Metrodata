import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Outlet } from "react-router";
import { AboutDrawer } from "./AboutDrawer";
import { TopBar } from "./TopBar";
import { useTheme } from "./useTheme";

export function AppShell() {
  const [theme, toggleTheme] = useTheme();
  const [aboutOpen, setAboutOpen] = useState(false);
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-30 rounded bg-amber px-3 py-2 font-semibold text-[#0e3b43] focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopBar theme={theme} onToggleTheme={toggleTheme} onOpenAbout={() => setAboutOpen(true)} />
      <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <AboutDrawer open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </MotionConfig>
  );
}
