import * as Plot from "@observablehq/plot";
import { formatCompact } from "../lib/format";
import { PlotFigure } from "../ui/PlotFigure";

interface Props {
  values: number[];
  hour: number;
  color: string;
  label: string;
  theme: string;
}

const HOURS = Array.from({ length: 20 }, (_, i) => i + 4);

// Area chart of the mean hourly profile with the current hour marked
export function ProfileChart({ values, hour, color, label, theme }: Props) {
  const data = HOURS.map((h, i) => ({ h, v: values[i] ?? 0 }));
  const current = data.find((d) => d.h === Math.floor(hour));
  return (
    <PlotFigure
      deps={[values, Math.floor(hour), color, theme]}
      render={() =>
        Plot.plot({
          width: 340,
          height: 170,
          marginLeft: 44,
          marginRight: 8,
          marginBottom: 26,
          ariaLabel: label,
          style: {
            color: "var(--ink-muted)",
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            background: "transparent",
          },
          x: { domain: [4, 23], ticks: [4, 8, 12, 16, 20, 23], tickFormat: (h: number) => `${h}h`, label: null },
          y: { grid: true, tickFormat: formatCompact, label: "boardings / hour", labelAnchor: "top" },
          marks: [
            Plot.areaY(data, { x: "h", y: "v", fill: color, fillOpacity: 0.22, curve: "monotone-x" }),
            Plot.lineY(data, { x: "h", y: "v", stroke: color, strokeWidth: 2.2, curve: "monotone-x" }),
            current
              ? Plot.ruleX([current.h], { stroke: "var(--ink)", strokeOpacity: 0.35, strokeDasharray: "3,3" })
              : null,
            current
              ? Plot.dot([current], { x: "h", y: "v", r: 5, fill: color, stroke: "var(--surface)", strokeWidth: 2 })
              : null,
          ],
        })
      }
    />
  );
}
