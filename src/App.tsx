import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppShell } from "./app/AppShell";
import { PAGES } from "./app/pages";
import { NotFound } from "./pages/NotFound";
import { PagePlaceholder } from "./pages/PagePlaceholder";
import { Loading } from "./ui/Status";

// Map pages pull in MapLibre and deck.gl, so they load on demand
const FlowPage = lazy(() => import("./pages/FlowPage").then((m) => ({ default: m.FlowPage })));
const PeaksPage = lazy(() => import("./pages/PeaksPage").then((m) => ({ default: m.PeaksPage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage })));

const PHASE_BY_PATH: Record<string, number> = { "/": 4, "/peaks": 5, "/calendar": 6, "/access": 7 };

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<Loading label="Loading the map" />}>
                <FlowPage />
              </Suspense>
            }
          />
          <Route
            path="/peaks"
            element={
              <Suspense fallback={<Loading label="Loading charts" />}>
                <PeaksPage />
              </Suspense>
            }
          />
          <Route
            path="/calendar"
            element={
              <Suspense fallback={<Loading label="Loading the calendar" />}>
                <CalendarPage />
              </Suspense>
            }
          />
          {PAGES.filter((p) => !["/", "/peaks", "/calendar"].includes(p.path)).map((p) => (
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
