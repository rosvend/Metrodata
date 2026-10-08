import { motion } from "motion/react";
import { NavLink, useLocation } from "react-router";
import { PAGES } from "./pages";

// Plain text links with a green underline under the current page, as on metrodemedellin.gov.co
export function MainNav() {
  const { pathname, search } = useLocation();
  return (
    <nav aria-label="Pages">
      <ul className="flex gap-6 sm:gap-8">
        {PAGES.map((page) => {
          const active = pathname === page.path;
          return (
            <li key={page.path}>
              <NavLink
                to={{ pathname: page.path, search }}
                aria-current={active ? "page" : undefined}
                className={`relative block py-2 text-[17px] ${active ? "font-semibold text-ink" : "font-normal text-ink-muted hover:text-ink"}`}
              >
                {page.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-green"
                    transition={{ type: "spring", stiffness: 480, damping: 38 }}
                  />
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
