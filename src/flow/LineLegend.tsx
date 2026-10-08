import { useT } from "../i18n/lang";
import { MODE_LABELS } from "../lib/lines";
import { compactValue } from "./describe";
import { type Metric, interpolate, metricValue } from "./metrics";
import type { FlowLine } from "./model";
import { LineBadge } from "./LineBadge";

interface Props {
  flow: FlowLine[];
  t: number;
  metric: Metric;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

// Line selector styled after the "Estado de las líneas" panel on metrodemedellin.gov.co
export function LineLegend({ flow, t: hour, metric, selected, onSelect }: Props) {
  const t = useT();
  return (
    <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12" aria-label={t.flow.linesLabel}>
      {flow.map((l) => {
        const v = metricValue(interpolate(l.values, hour), metric, l);
        const active = selected === l.id;
        return (
          <li key={l.id}>
            <button
              type="button"
              aria-pressed={active}
              aria-label={t.flow.legendItem(l.info.badge, MODE_LABELS[l.info.mode], compactValue(metric, v))}
              onClick={() => onSelect(active ? null : l.id)}
              className={`flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors ${
                active ? "bg-white/14 ring-1 ring-green" : "hover:bg-white/8"
              }`}
            >
              <LineBadge info={l.info} />
              <span className="text-[13px] font-semibold text-panel-ink tabular-nums">{compactValue(metric, v)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
