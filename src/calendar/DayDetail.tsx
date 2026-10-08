import * as Plot from "@observablehq/plot";
import type { SpikeProfiles, SpikesJson } from "../data/types";
import { hourBand } from "../flow/metrics";
import { useLang, useT } from "../i18n/lang";
import { formatCompact, formatDate, formatInt } from "../lib/format";
import { hourTick, plotStyle } from "../peaks/plotStyle";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { signed } from "./colors";
import { DriverTag } from "./DriverTag";
import { driverText, holidayName } from "./labels";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Props {
  date: string;
  spikes: SpikesJson;
  profiles: SpikeProfiles;
  theme: string;
}

// One day's hourly boardings (core lines) against the expected profile of its comparable days
export function DayDetail({ date, spikes, profiles, theme }: Props) {
  const t = useT();
  const { lang } = useLang();
  const c = t.calendar;
  const [ref, { width }] = useSize<HTMLDivElement>();
  const i = spikes.dates.indexOf(date);
  const p = profiles.dates.indexOf(date);
  if (i < 0 || p < 0) return <p className="text-ink-muted">{c.noCoreData(formatDate(date))}</p>;

  const actual = profiles.actual[p] ?? [];
  const expected = profiles.expected[p];
  const value = spikes.spike_index[i];
  const expectedTotal = spikes.expected[i];
  const holiday = holidayName(spikes, i, lang);
  const rows = actual.map((a, k) => ({ h: k + 4, a, e: expected?.[k] ?? null }));

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-[17px] font-semibold">{formatDate(date)}</div>
          <div className="text-[13px] text-ink-muted">
            {capitalize(t.filters.daySingular[spikes.day_type[i] ?? "weekday"])}
            {holiday ? `, ${holiday}` : ""}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-[22px] font-bold tabular-nums ${value === null || value === undefined ? "text-ink-muted" : value < 0 ? "text-alert" : "text-spike"}`}
          >
            {value === null || value === undefined ? "n/a" : signed(value)}
          </div>
          <div className="text-[12px] text-ink-muted tabular-nums">
            {c.versusExpected(formatInt(spikes.actual[i] ?? 0), expectedTotal ? formatInt(expectedTotal) : null)}
          </div>
        </div>
      </div>
      <DriverTag label={driverText(t, spikes, i, lang)} none={spikes.driver[i] === "none"} />
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
              ariaLabel: c.dayLabel(formatDate(date)),
              x: { domain: [4, 23], ticks: [4, 8, 12, 16, 20], tickFormat: hourTick, label: null },
              y: { grid: true, tickFormat: formatCompact, label: t.peaks.perHour, labelAnchor: "top" },
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
                      `${hourBand(r.h)}\n${c.tipActual(formatInt(r.a))}` +
                      (r.e !== null ? `\n${c.tipExpected(formatInt(r.e))}` : ""),
                  }),
                ),
              ],
            })
          }
        />
      )}
      <p className="text-[12px] text-ink-faint">
        {c.dayNote(spikes.n_comparables[i] ?? 0, spikes.window_days, spikes.lines_used.join(", "))}
      </p>
    </div>
  );
}
