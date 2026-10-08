import { BrowserRouter, Route, Routes } from "react-router";
import { AppShell } from "./app/AppShell";
import { PAGES } from "./app/pages";
import { NotFound } from "./pages/NotFound";
import { PagePlaceholder } from "./pages/PagePlaceholder";

const PHASE_BY_PATH: Record<string, number> = { "/": 4, "/peaks": 5, "/calendar": 6, "/access": 7 };

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {PAGES.map((p) => (
            <Route
              key={p.path}
              path={p.path}
              element={<PagePlaceholder page={p} phase={PHASE_BY_PATH[p.path] ?? 0} />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
