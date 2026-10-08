import * as Plot from "@observablehq/plot";
import type { LineKpis } from "../data/types";
import { formatCompact, formatDate, formatDecimal, formatInt } from "../lib/format";
import { lineInfo } from "../lib/lines";
import { useT } from "../i18n/lang";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { plotStyle } from "./plotStyle";

interface Point {
  year: number;
  date: string;
  peak: number;
  hour: number;
}

interface Props {
  line: string;
  points: Point[];
  byYear: Record<string, LineKpis | undefined>;
  theme: string;
}

// Deterministic jitter so dots spread vertically without moving between renders
const jitter = (date: string) => {
  let h = 0;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h / 997;
};

// Strip plot of each weekday's peak-hour boardings, one row per year, with median and P95 ticks
export function Saturation({ line, points, byYear, theme }: Props) {
  const t = useT();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const color = lineInfo(line).color;
  const marks = Object.entries(byYear).flatMap(([y, k]) =>
    k ? [{ year: Number(y), median: k.daily_peak_median, p95: k.daily_peak_p95, si: k.saturation_index }] : [],
  );
  return (
    <div ref={ref}>
      {width > 0 && (
        <PlotFigure
          deps={[line, points, width, theme]}
          render={() =>
            Plot.plot({
              width,
              height: 200,
              marginLeft: 40,
              marginRight: 70,
              marginBottom: 32,
              style: plotStyle,
              ariaLabel: t.peaks.satLabel(lineInfo(line).badge),
              fy: { label: null, tickSize: 0, tickFormat: String },
              y: { axis: null, domain: [-0.15, 1.15] },
              x: { grid: true, tickFormat: formatCompact, label: null, ticks: 5 },
              marks: [
                Plot.dot(points, {
                  x: "peak",
                  y: (d: Point) => jitter(d.date),
                  fy: "year",
                  r: 2,
                  fill: color,
                  fillOpacity: 0.55,
                  title: (d: Point) => t.peaks.satTip(formatDate(d.date), formatInt(d.peak), d.hour),
                  tip: true,
                }),
                Plot.ruleX(marks, { x: "median", fy: "year", y1: -0.1, y2: 1.1, stroke: "var(--ink)", strokeWidth: 2 }),
                Plot.ruleX(marks, {
                  x: "p95",
                  fy: "year",
                  y1: -0.1,
                  y2: 1.1,
                  stroke: "var(--ink)",
                  strokeDasharray: "3,2",
                }),
                Plot.text(marks, {
                  fy: "year",
                  frameAnchor: "right",
                  dx: 66,
                  text: (d: { si: number }) => `SI ${formatDecimal(d.si, 2)}`,
                  fill: "var(--ink)",
                  fontWeight: 600,
                }),
              ],
            })
          }
        />
      )}
    </div>
  );
}
