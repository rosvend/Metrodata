import type { LineProps, StationProps } from "../data/types";
import { MODE_LABELS } from "../lib/lines";
import { formatInt } from "../lib/format";
import { describeValue } from "./describe";
import type { Hover } from "./FlowMap";
import { type Metric, hourBand, interpolate, metricValue } from "./metrics";
import type { FlowLine } from "./model";
import { LineBadge } from "./LineBadge";

interface Props {
  hover: Hover;
  flow: FlowLine[];
  noData: LineProps[];
  stations: Map<string, StationProps>;
  t: number;
  metric: Metric;
  context: string;
}

function LineTip({ line, t, metric, context }: { line: FlowLine; t: number; metric: Metric; context: string }) {
  const raw = interpolate(line.values, t);
  return (
    <>
      <div className="flex items-center gap-2.5">
        <LineBadge info={line.info} size="sm" />
        <div className="leading-tight">
          <div className="font-semibold">{line.info.name}</div>
          <div className="text-[12px] text-panel-muted">{MODE_LABELS[line.info.mode]}</div>
        </div>
      </div>
      <div className="mt-2.5 text-[15px] font-semibold">{describeValue(metric, metricValue(raw, metric, line))}</div>
      {metric !== "boardings" && <div className="text-[13px]">{formatInt(raw)} boardings</div>}
      <div className="mt-1 text-[12px] text-panel-muted">
        {hourBand(t)}, {context}
      </div>
      {line.planned && (
        <div className="mt-1.5 text-[12px] text-panel-muted">
          Shape and length are indicative: the source draws the planned Corredor de la 80.
        </div>
      )}
    </>
  );
}

export function Tooltip({ hover, flow, noData, stations, t, metric, context }: Props) {
  const { target } = hover;
  let body: React.ReactNode = null;
  if (target.kind === "line") {
    const line = flow.find((l) => l.id === target.id);
    if (line) body = <LineTip line={line} t={t} metric={metric} context={context} />;
  } else if (target.kind === "nodata") {
    const line = noData.find((l) => l.id === target.id);
    body = (
      <>
        <div className="font-semibold">{line?.name ?? target.id}</div>
        <div className="mt-1 text-[13px] text-panel-muted">No ridership data for this line.</div>
      </>
    );
  } else {
    const st = stations.get(target.id);
    body = st && (
      <>
        <div className="font-semibold">{st.name}</div>
        <div className="mt-1 text-[13px] text-panel-muted">Lines {st.lines.join(", ")}</div>
        <div className="mt-1 text-[12px] text-panel-muted">Ridership is recorded per line, not per station.</div>
      </>
    );
  }
  if (!body) return null;
  return (
    <div
      className="pointer-events-none absolute z-10 w-max max-w-72 rounded-2xl bg-panel px-4 py-3 text-[14px] text-panel-ink shadow-xl"
      style={{ left: hover.x + 14, top: hover.y + 14 }}
    >
      {body}
    </div>
  );
}
