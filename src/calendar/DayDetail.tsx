import * as Plot from "@observablehq/plot";
import type { SpikeProfiles, SpikesJson } from "../data/types";
import { DAY_TYPE_SINGULAR } from "../lib/filters";
import { formatCompact, formatDate, formatInt } from "../lib/format";
import { hourBand } from "../flow/metrics";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { hourTick, plotStyle } from "../peaks/plotStyle";
import { signed } from "./colors";
import { DriverTag } from "./DriverTag";

interface Props {
  date: string;
  spikes: SpikesJson;
  profiles: SpikeProfiles;
  theme: string;
}

// One day's hourly boardings (core lines) against the expected profile of its comparable days
export function DayDetail({ date, spikes, profiles, theme }: Props) {
  const [ref, { width }] = useSize<HTMLDivElement>();
  const i = spikes.dates.indexOf(date);
  const p = profiles.dates.indexOf(date);
  if (i < 0 || p < 0) return <p className="text-ink-muted">No core-line data for {formatDate(date)}.</p>;

  const actual = profiles.actual[p] ?? [];
  const expected = profiles.expected[p];
  const value = spikes.spike_index[i];
  const rows = actual.map((a, k) => ({ h: k + 4, a, e: expected?.[k] ?? null }));

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-[17px] font-semibold">{formatDate(date)}</div>
          <div className="text-[13px] text-ink-muted">
            {DAY_TYPE_SINGULAR[spikes.day_type[i] ?? "weekday"]}
            {spikes.holiday[i] ? `, ${spikes.holiday[i]}` : ""}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-[22px] font-bold tabular-nums ${value === null || value === undefined ? "text-ink-muted" : value < 0 ? "text-alert" : "text-spike"}`}
          >
            {value === null || value === undefined ? "n/a" : signed(value)}
          </div>
          <div className="text-[12px] text-ink-muted tabular-nums">
            {formatInt(spikes.actual[i] ?? 0)} vs {spikes.expected[i] ? formatInt(spikes.expected[i] ?? 0) : "no"}{" "}
            expected
          </div>
        </div>
      </div>
      <DriverTag label={spikes.driver_label[i] ?? ""} />
      {width > 0 && (
        <PlotFigure
          deps={[date, width, theme]}
          render={() =>
            Plot.plot({
              width,
              height: 190,
              marginLeft: 40,
              marginBottom: 22,
              style: plotStyle,
              ariaLabel: `Hourly boardings on ${date} compared with the expected profile`,
              x: { domain: [4, 23], ticks: [4, 8, 12, 16, 20], tickFormat: hourTick, label: null },
              y: { grid: true, tickFormat: formatCompact, label: "Boardings per hour", labelAnchor: "top" },
              marks: [
                expected
                  ? Plot.areaY(rows, {
                      x: "h",
                      y: "e",
                      fill: "var(--ink-faint)",
                      fillOpacity: 0.15,
                      curve: "monotone-x",
                    })
                  : null,
                expected
                  ? Plot.lineY(rows, {
                      x: "h",
                      y: "e",
                      stroke: "var(--ink-faint)",
                      strokeDasharray: "4,3",
                      curve: "monotone-x",
                    })
                  : null,
                Plot.lineY(rows, { x: "h", y: "a", stroke: "var(--ink)", strokeWidth: 2.4, curve: "monotone-x" }),
                Plot.tip(
                  rows,
                  Plot.pointerX({
                    x: "h",
                    y: "a",
                    title: (r: { h: number; a: number; e: number | null }) =>
                      `${hourBand(r.h)}\nActual: ${formatInt(r.a)}` +
                      (r.e !== null ? `\nExpected: ${formatInt(r.e)}` : ""),
                  }),
                ),
              ],
            })
          }
        />
      )}
      <p className="text-[12px] text-ink-faint">
        Solid: this day. Dashed: median of {spikes.n_comparables[i]} comparable days (same weekday and day type, ±
        {spikes.window_days} days). Core lines {spikes.lines_used.join(", ")}.
      </p>
    </div>
  );
}
