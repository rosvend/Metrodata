import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const DURATION_MS = 1100;

// 0 → 1 over DURATION_MS whenever `key` changes; jumps straight to 1 with reduced motion
export function useGrow(key: string | null): number {
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState({ key, progress: 1 });
  useEffect(() => {
    if (reduced || key === null) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION_MS, 1);
      setState({ key, progress: p });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, reduced]);
  return reduced || state.key !== key ? (reduced ? 1 : 0) : state.progress;
}

// Each contour grows in turn (5 then 10 then 15 minutes) with an ease-out
export function contourScale(progress: number, minutes: number): number {
  const start = ((minutes / 5 - 1) * 0.5) / 2;
  const t = Math.min(Math.max((progress - start) / 0.5, 0), 1);
  return 1 - (1 - t) ** 3;
}
