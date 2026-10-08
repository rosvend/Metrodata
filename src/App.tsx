import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppShell } from "./app/AppShell";
import { NotFound } from "./pages/NotFound";
import { Loading } from "./ui/Status";

// Map pages pull in MapLibre and deck.gl, so they load on demand
const FlowPage = lazy(() => import("./pages/FlowPage").then((m) => ({ default: m.FlowPage })));
const PeaksPage = lazy(() => import("./pages/PeaksPage").then((m) => ({ default: m.PeaksPage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage })));
const AccessPage = lazy(() => import("./pages/AccessPage").then((m) => ({ default: m.AccessPage })));

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<Loading />}>
                <FlowPage />
              </Suspense>
            }
          />
          <Route
            path="/peaks"
            element={
              <Suspense fallback={<Loading />}>
                <PeaksPage />
              </Suspense>
            }
          />
          <Route
            path="/calendar"
            element={
              <Suspense fallback={<Loading />}>
                <CalendarPage />
              </Suspense>
            }
          />
          <Route
            path="/access"
            element={
              <Suspense fallback={<Loading />}>
                <AccessPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
