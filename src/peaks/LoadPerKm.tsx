import * as Plot from "@observablehq/plot";
import { formatInt } from "../lib/format";
import { lineInfo } from "../lib/lines";
import { useT } from "../i18n/lang";
import { PlotFigure } from "../ui/PlotFigure";
import { useSize } from "../ui/useSize";
import { plotStyle } from "./plotStyle";

interface Item {
  line: string;
  value: number;
  indicative: boolean;
}

export function LoadPerKm({ items, theme }: { items: Item[]; theme: string }) {
  const t = useT();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const label = (d: Item) => lineInfo(d.line).badge;
  return (
    <div ref={ref}>
      {width > 0 && (
        <PlotFigure
          deps={[items, width, theme]}
          render={() =>
            Plot.plot({
              width,
              height: items.length * 20 + 34,
              marginLeft: 28,
              marginRight: 52,
              style: plotStyle,
              ariaLabel: t.peaks.loadLabel,
              x: { grid: true, label: null, tickFormat: formatInt, ticks: 4 },
              y: { domain: items.map(label), tickSize: 0, label: null },
              marks: [
                Plot.ruleY(items, { y: label, x1: 0, x2: "value", stroke: "var(--ink-faint)", strokeOpacity: 0.5 }),
                Plot.dot(items, {
                  y: label,
                  x: "value",
                  r: 5.5,
                  fill: (d: Item) => (d.indicative ? "var(--soft)" : lineInfo(d.line).color),
                  stroke: (d: Item) => lineInfo(d.line).color,
                  strokeWidth: 2,
                  title: (d: Item) => t.peaks.loadTip(label(d), formatInt(d.value), d.indicative),
                  tip: true,
                }),
                Plot.text(items, {
                  y: label,
                  x: "value",
                  text: (d: Item) => `${formatInt(d.value)}${d.indicative ? "*" : ""}`,
                  dx: 12,
                  textAnchor: "start",
                  fill: "var(--ink)",
                }),
              ],
            })
          }
        />
      )}
    </div>
  );
}
