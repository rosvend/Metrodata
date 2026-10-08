import { motion } from "motion/react";
import { NavLink, useLocation } from "react-router";
import { PAGES } from "./pages";

// Page navigation drawn as a metro line; the amber dot marks the current station
export function LineNav() {
  const { pathname, search } = useLocation();
  return (
    <nav aria-label="Pages" className="relative">
      <div aria-hidden className="absolute inset-x-[2.375rem] top-[11px] h-[3px] rounded-full bg-bar-muted/45" />
      <ol className="relative flex">
        {PAGES.map((page) => {
          const active = pathname === page.path;
          return (
            <li key={page.path} className="w-[4.75rem]">
              <NavLink
                to={{ pathname: page.path, search }}
                className="group flex flex-col items-center gap-1 rounded-md py-0.5 outline-offset-4"
                aria-current={active ? "page" : undefined}
              >
                <span className="relative grid size-[25px] place-items-center">
                  <span className="size-[13px] rounded-full border-[3px] border-bar-ink bg-bar transition-transform group-hover:scale-110" />
                  {active && (
                    <motion.span
                      layoutId="current-station"
                      className="absolute size-[17px] rounded-full border-[3px] border-bar-ink bg-amber"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </span>
                <span
                  className={`text-[13px] leading-none ${active ? "font-bold text-bar-ink" : "text-bar-muted group-hover:text-bar-ink"}`}
                >
                  {page.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
