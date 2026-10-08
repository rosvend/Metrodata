import * as Plot from "@observablehq/plot";
import { formatCompact, formatInt, formatPercent } from "../lib/format";
import { lineInfo } from "../lib/lines";
import { useT } from "../i18n/lang";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { hourBand } from "../flow/metrics";
import { hourTick, plotStyle } from "./plotStyle";
import type { Cell, HeatMode } from "./shape";

interface Props {
  cells: Cell[];
  mode: HeatMode;
  lines: string[];
  theme: string;
}

const colorScale = (mode: HeatMode) => ({
  type: mode === "share" ? ("linear" as const) : ("sqrt" as const),
  scheme: "YlGn" as const,
  label: null,
  tickFormat: mode === "share" ? (v: number) => formatPercent(v, { digits: 0 }) : formatCompact,
});

// Compact color legend for the card header
export function HeatLegend({ cells, mode }: { cells: Cell[]; mode: HeatMode }) {
  const max = Math.max(...cells.map((c) => c.value), 0);
  return (
    <PlotFigure
      deps={[mode, max]}
      render={() =>
        Plot.legend({
          color: { ...colorScale(mode), domain: [0, max] },
          width: 220,
          height: 36,
          marginTop: 4,
          marginBottom: 18,
          ticks: 4,
          style: { ...plotStyle, fontSize: "11px" },
        }) as Element
      }
    />
  );
}

export function Heatmap({ cells, mode, lines, theme }: Props) {
  const t = useT();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const badge = (id: string) => lineInfo(id).badge;
  return (
    <div ref={ref}>
      {width > 0 && (
        <PlotFigure
          deps={[cells, mode, width, theme]}
          render={() =>
            Plot.plot({
              width,
              height: lines.length * 17 + 30,
              marginLeft: 28,
              marginTop: 6,
              marginBottom: 24,
              style: plotStyle,
              ariaLabel: t.peaks.heatLabel(mode === "share"),
              x: { type: "band", tickFormat: hourTick, tickSize: 0, label: null },
              y: { domain: lines.map(badge), tickSize: 0, label: null },
              color: colorScale(mode),
              marks: [
                Plot.cell(cells, {
                  x: "hour",
                  y: (d: Cell) => badge(d.line),
                  fill: "value",
                  inset: 0.6,
                  rx: 3,
                  title: (d: Cell) =>
                    t.peaks.heatTip(badge(d.line), hourBand(d.hour), formatInt(d.raw)) +
                    (mode === "share" ? t.peaks.heatTipShare(formatPercent(d.value)) : ""),
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
