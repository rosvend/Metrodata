import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { AccessSummary, IsochroneStats, KpiReport, SpikesJson } from "../data/types";
import { loadJson } from "../data/load";
import { demoFacts } from "./facts";
import { type DemoStep, demoSteps } from "./steps";
import { DemoCtx } from "./useDemo";

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<DemoStep[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = useCallback(
    (i: number) => {
      const step = steps[i];
      if (!step) return;
      setIndex(i);
      navigate(step.url);
    },
    [steps, navigate],
  );

  // Bring the narrated card into view once the page has rendered
  const anchor = index === null ? undefined : steps[index]?.anchor;
  useEffect(() => {
    if (!anchor) return;
    const timer = window.setTimeout(() => {
      document
        .querySelector(`section[aria-label="${anchor}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [anchor, index]);

  const start = useCallback(() => {
    setError(null);
    Promise.all([
      loadJson<KpiReport>("kpis.json"),
      loadJson<SpikesJson>("spikes.json"),
      loadJson<AccessSummary>("access.json"),
      loadJson<IsochroneStats>("isochrone_stats.json"),
    ]).then(
      ([k, s, a, i]) => {
        const built = demoSteps(demoFacts(k, s, a, i));
        setSteps(built);
        setIndex(0);
        navigate(built[0]?.url ?? "/");
      },
      (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
    );
  }, [navigate]);

  const stop = useCallback(() => setIndex(null), []);

  // Arrow keys move through the tour, Escape leaves it
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(Math.min(index + 1, steps.length - 1));
      if (e.key === "ArrowLeft") go(Math.max(index - 1, 0));
      if (e.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, steps.length, go, stop]);

  const value = useMemo(() => ({ steps, index, error, start, go, stop }), [steps, index, error, start, go, stop]);
  return <DemoCtx value={value}>{children}</DemoCtx>;
}
