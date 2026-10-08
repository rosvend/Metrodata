import * as Plot from "@observablehq/plot";
import { formatCompact, formatInt, formatPercent } from "../lib/format";
import { hourBand } from "../flow/metrics";
import { useT } from "../i18n/lang";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { hourTick, plotStyle } from "../peaks/plotStyle";
import { SPIKE_RANGE } from "./colors";
import type { hourlyYoY, monthlyYoY } from "./shape";

const YEAR_COLORS: Record<number, string> = {
  2024: "var(--ink-faint)",
  2025: "var(--ink)",
  2026: "var(--metro-green)",
};

// Dumbbell per month: one dot per year, joined by a rule
export function MonthlyTrend({ rows, theme }: { rows: ReturnType<typeof monthlyYoY>; theme: string }) {
  const t = useT();
  const months = t.calendar.months;
  const [ref, { width }] = useSize<HTMLDivElement>();
  const dots = rows.flatMap((r) => Object.entries(r.values).map(([y, v]) => ({ month: r.month, year: Number(y), v })));
  const spans = rows.map((r) => ({
    month: r.month,
    lo: Math.min(...Object.values(r.values)),
    hi: Math.max(...Object.values(r.values)),
  }));
  return (
    <div ref={ref}>
      <ul className="mb-1 flex gap-4 text-[12px] text-ink-muted" aria-label="Legend">
        {[2024, 2025, 2026].map((y) => (
          <li key={y} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: YEAR_COLORS[y] }} />
            {y}
          </li>
        ))}
      </ul>
      {width > 0 && (
        <PlotFigure
          deps={[rows, width, theme]}
          render={() =>
            Plot.plot({
              width,
              height: 200,
              marginLeft: 44,
              marginBottom: 22,
              style: plotStyle,
              ariaLabel: t.calendar.monthlyLabel,
              x: { type: "band", domain: [1, 2, 3, 4, 5, 6, 7], tickFormat: (m: number) => months[m - 1], label: null },
              y: {
                grid: true,
                tickFormat: formatCompact,
                label: t.calendar.monthlyAxis,
                labelAnchor: "top",
                zero: false,
              },
              marks: [
                Plot.ruleX(spans, {
                  x: "month",
                  y1: "lo",
                  y2: "hi",
                  stroke: "var(--rule)",
                  strokeWidth: 6,
                  strokeLinecap: "round",
                }),
                Plot.dot(dots, {
                  x: "month",
                  y: "v",
                  r: 5,
                  fill: (d: { year: number }) => YEAR_COLORS[d.year],
                  title: (d: { month: number; year: number; v: number }) =>
                    t.calendar.monthlyTip(months[d.month - 1] ?? "", d.year, formatInt(d.v)),
                  tip: true,
                }),
              ],
            })
          }
        />
      )}
    </div>
  );
}

// Change per hour band, 2026 vs 2025 (Jan–Jul), as diverging bars
export function HourlyTrend({ rows, theme }: { rows: ReturnType<typeof hourlyYoY>; theme: string }) {
  const t = useT();
  const [ref, { width }] = useSize<HTMLDivElement>();
  return (
    <div ref={ref}>
      {width > 0 && (
        <PlotFigure
          deps={[rows, width, theme]}
          render={() =>
            Plot.plot({
              width,
              height: 216,
              marginLeft: 44,
              marginBottom: 22,
              style: plotStyle,
              ariaLabel: t.calendar.hourlyLabel,
              x: { type: "band", tickFormat: hourTick, label: null },
              y: {
                grid: true,
                tickFormat: (v: number) => formatPercent(v, { signed: true, digits: 0 }),
                label: t.calendar.hourlyAxis,
                labelAnchor: "top",
              },
              marks: [
                Plot.ruleY([0], { stroke: "var(--ink-faint)" }),
                Plot.barY(rows, {
                  x: "hour",
                  y: "change",
                  fill: (r: { change: number }) => (r.change < 0 ? SPIKE_RANGE[0] : SPIKE_RANGE[2]),
                  rx: 2,
                  title: (r: { hour: number; before: number; after: number; change: number }) =>
                    `${hourBand(r.hour)}\n2025: ${formatInt(r.before)}\n2026: ${formatInt(r.after)}\n${formatPercent(r.change, { signed: true })}`,
                  tip: true,
                }),
              ],
            })
          }
        />
      )}
    </div>
  );
}
