import { useEffect, useRef } from "react";

// Mounts an Observable Plot (or any SVG/HTML element) produced by `render`; re-renders when deps change
export function PlotFigure({ render, deps }: { render: () => Element; deps: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = render();
    ref.current?.replaceChildren(el);
    return () => el.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return <div ref={ref} className="plot-figure" />;
}
