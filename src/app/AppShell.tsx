import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Outlet } from "react-router";
import { DemoBar } from "../demo/DemoBar";
import { DemoProvider } from "../demo/DemoContext";
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
        <DemoProvider>
          <a
            href="#main"
            className="sr-only z-30 rounded-full bg-green px-4 py-2 font-semibold text-metro-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Skip to content
          </a>
          {/* On large screens the shell is exactly one viewport tall; pages scroll inside main */}
          <div className="flex min-h-dvh flex-col lg:h-dvh">
            <TopBar theme={theme} onToggleTheme={toggleTheme} onOpenAbout={() => setAboutOpen(true)} />
            <DemoBar />
            <main id="main" className="flex-1 lg:min-h-0 lg:overflow-y-auto">
              <Outlet />
            </main>
          </div>
          <AboutDrawer open={aboutOpen} onClose={() => setAboutOpen(false)} />
        </DemoProvider>
      </MotionConfig>
    </ThemeContext>
  );
}
