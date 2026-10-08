import * as Plot from "@observablehq/plot";
import type { DailyTotals, SpikesJson } from "../data/types";
import { formatDate, formatInt } from "../lib/format";
import type { Messages } from "../i18n/en";
import { type Lang, useLang, useT } from "../i18n/lang";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { plotStyle } from "../peaks/plotStyle";
import { signed, spikeScale } from "./colors";
import { driverText, holidayName } from "./labels";
import type { DayCell } from "./shape";

interface Props {
  cells: DayCell[];
  spikes: SpikesJson;
  daily: DailyTotals;
  selected: string | null;
  onSelect: (date: string) => void;
  theme: string;
}

function describe(t: Messages, lang: Lang, c: DayCell, spikes: SpikesJson, systemByDate: Map<string, number>): string {
  const c_ = t.calendar;
  const head = formatDate(c.date);
  if (c.status === "missing") return `${head}\n${c_.tipMissing}`;
  if (c.status === "excluded") return `${head}\n${c_.tipExcluded}`;
  const i = c.index;
  const all = systemByDate.get(c.date);
  const lines = [
    head,
    c_.tipCore(formatInt(spikes.actual[i] ?? 0)),
    all !== undefined ? c_.tipAll(formatInt(all)) : "",
  ];
  const expected = spikes.expected[i];
  if (c.status === "ok" && expected)
    lines.push(c_.tipExpected(formatInt(expected)), c_.tipDeviation(signed(c.value ?? 0)));
  else lines.push(c_.tipNoBaseline);
  const holiday = holidayName(spikes, i, lang);
  if (holiday) lines.push(c_.tipHoliday(holiday));
  lines.push(c_.tipDriver(driverText(t, spikes, i, lang)));
  return lines.filter(Boolean).join("\n");
}

// GitHub-style calendar: weeks as columns, weekdays as rows, color = spike_index
export function CalendarHeatmap({ cells, spikes, daily, selected, onSelect, theme }: Props) {
  const t = useT();
  const { lang } = useLang();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const systemByDate = new Map(daily.dates.map((d, i) => [d, daily.system[i] ?? 0]));
  const firstOfMonth = cells.filter((c) => c.date.endsWith("-01"));
  const sel = cells.filter((c) => c.date === selected);
  const weeks = Math.max(...cells.map((c) => c.week), 0) + 1;
  return (
    <div ref={ref}>
      {width > 0 && (
        <PlotFigure
          deps={[cells, selected, width, theme, weeks]}
          render={() => {
            const plot = Plot.plot({
              width,
              height: 7 * 17 + 34,
              marginLeft: 34,
              marginTop: 22,
              marginBottom: 4,
              padding: 0.12,
              style: plotStyle,
              ariaLabel: t.calendar.heatLabel,
              x: { axis: null, domain: Array.from({ length: weeks }, (_, i) => i) },
              y: {
                domain: [0, 1, 2, 3, 4, 5, 6],
                tickFormat: (d: number) => t.calendar.weekdays[d],
                tickSize: 0,
                label: null,
              },
              color: spikeScale,
              marks: [
                Plot.cell(cells, {
                  x: "week",
                  y: "dow",
                  fill: (c: DayCell) => (c.status === "ok" ? c.value : null),
                  rx: 3,
                  stroke: (c: DayCell) => (c.status === "ok" ? "none" : "var(--ink-faint)"),
                  strokeOpacity: 0.5,
                }),
                Plot.cell(
                  cells.filter((c) => c.status === "excluded"),
                  { x: "week", y: "dow", rx: 3, fill: "none", stroke: "var(--alert)", strokeDasharray: "2,2" },
                ),
                Plot.cell(sel, { x: "week", y: "dow", stroke: "var(--ink)", strokeWidth: 2.5, fill: "none", rx: 3 }),
                Plot.text(firstOfMonth, {
                  x: "week",
                  y: () => 0,
                  dy: -16,
                  text: (c: DayCell) => t.calendar.months[c.month - 1],
                  textAnchor: "start",
                  fill: "var(--ink-muted)",
                }),
                Plot.tip(
                  cells,
                  Plot.pointer({
                    x: "week",
                    y: "dow",
                    title: (c: DayCell) => describe(t, lang, c, spikes, systemByDate),
                  }),
                ),
              ],
            });
            plot.addEventListener("click", () => {
              const v = (plot as unknown as { value: DayCell | null }).value;
              if (v && v.status !== "missing") onSelect(v.date);
            });
            plot.style.cursor = "pointer";
            return plot;
          }}
        />
      )}
    </div>
  );
}
