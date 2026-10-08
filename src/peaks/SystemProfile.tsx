import * as Plot from "@observablehq/plot";
import { formatCompact, formatInt } from "../lib/format";
import { useT } from "../i18n/lang";
import type { DayType } from "../lib/filters";
import { hourBand } from "../flow/metrics";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { hourTick, plotStyle } from "./plotStyle";

interface Props {
  byDayType: Record<DayType, number[]>;
  selected: DayType;
  theme: string;
}

const COLORS: Record<DayType, string> = {
  weekday: "var(--ink)",
  saturday: "var(--accent)",
  sunday_holiday: "var(--ink-faint)",
};

export function DayTypeLegend({ selected }: { selected: DayType }) {
  const tr = useT();
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" aria-label={tr.peaks.legend}>
      {(Object.keys(COLORS) as DayType[]).map((t) => (
        <li
          key={t}
          className={`flex items-center gap-1.5 ${t === selected ? "font-semibold text-ink" : "text-ink-muted"}`}
        >
          <span aria-hidden className="h-[3px] w-4 rounded-full" style={{ background: COLORS[t] }} />
          {tr.filters.dayPlural[t]}
        </li>
      ))}
    </ul>
  );
}

export function SystemProfile({ byDayType, selected, theme }: Props) {
  const tr = useT();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const types = Object.keys(byDayType) as DayType[];
  const data = types.flatMap((t) => (byDayType[t] ?? []).map((v, i) => ({ t, h: i + 4, v })));
  return (
    <div ref={ref}>
      {width > 0 && (
        <PlotFigure
          deps={[byDayType, selected, width, theme]}
          render={() =>
            Plot.plot({
              width,
              height: 180,
              marginLeft: 44,
              marginBottom: 24,
              style: plotStyle,
              ariaLabel: tr.peaks.profileLabel,
              x: { domain: [4, 23], ticks: [4, 8, 12, 16, 20], tickFormat: hourTick, label: null },
              y: { grid: true, tickFormat: formatCompact, label: tr.peaks.perHour, labelAnchor: "top" },
              marks: [
                Plot.lineY(data, {
                  x: "h",
                  y: "v",
                  z: "t",
                  stroke: (d: { t: DayType }) => COLORS[d.t],
                  strokeWidth: (d: { t: DayType }) => (d.t === selected ? 3 : 1.6),
                  strokeOpacity: (d: { t: DayType }) => (d.t === selected ? 1 : 0.75),
                  curve: "monotone-x",
                }),
                Plot.tip(
                  data,
                  Plot.pointer({
                    x: "h",
                    y: "v",
                    title: (d: { t: DayType; h: number; v: number }) =>
                      tr.peaks.profileTip(tr.filters.dayPlural[d.t], hourBand(d.h), formatInt(d.v)),
                  }),
                ),
              ],
            })
          }
        />
      )}
    </div>
  );
}
