import { useState } from "react";
import type { DayTypePeaks, PeakStats } from "../data/types";
import { formatDecimal, formatPercent } from "../lib/format";
import { lineInfo } from "../lib/lines";
import { useT } from "../i18n/lang";
import { LineBadge } from "../flow/LineBadge";
import { InfoTip } from "../ui/InfoTip";

type SortKey = "line" | "hour" | "share" | "ratio";

interface Row {
  id: string;
  stats: PeakStats;
  profile: number[];
}

const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 64},${18 - (v / max) * 16}`).join(" ");
  return (
    <svg viewBox="0 0 64 20" className="h-4 w-16" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const SORTS: Record<SortKey, (a: Row, b: Row) => number> = {
  line: () => 0,
  hour: (a, b) => a.stats.peak_hour.hour - b.stats.peak_hour.hour,
  share: (a, b) => b.stats.peak_hour.share - a.stats.peak_hour.share,
  ratio: (a, b) => b.stats.peak_to_average_ratio - a.stats.peak_to_average_ratio,
};

export function PeakTable({ peaks, profiles }: { peaks: DayTypePeaks; profiles: Record<string, number[]> }) {
  const [sort, setSort] = useState<SortKey>("share");
  const t = useT();
  const rows: Row[] = Object.entries(peaks.lines).map(([id, stats]) => ({ id, stats, profile: profiles[id] ?? [] }));
  rows.sort(SORTS[sort]);

  const header = (key: SortKey, label: string, tip?: string) => (
    <th
      scope="col"
      aria-sort={sort === key && key !== "line" ? "descending" : "none"}
      className="py-1 text-left font-normal"
    >
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => setSort(key)}
          className={`hover:text-ink ${sort === key ? "font-semibold text-ink" : ""}`}
        >
          {label}
        </button>
        {tip && <InfoTip label={label.toLowerCase()} text={tip} />}
      </span>
    </th>
  );

  return (
    <table className="w-full text-[13px] leading-none tabular-nums">
      <thead className="text-[12px] text-ink-muted">
        <tr className="border-b border-rule">
          {header("line", t.peaks.colLine)}
          {header("hour", t.peaks.colPeakHour)}
          {header("share", t.peaks.colPeakShare, t.kpi.peak_hour)}
          {header("ratio", t.peaks.colRatio, t.kpi.peak_to_average)}
          <th scope="col" className="py-1 text-left font-normal">
            {t.peaks.colDay}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-rule font-semibold">
          <td className="py-0.5">{t.peaks.system}</td>
          <td>{pad(peaks.system.peak_hour.hour)}</td>
          <td>{formatPercent(peaks.system.peak_hour.share)}</td>
          <td>{formatDecimal(peaks.system.peak_to_average_ratio, 2)}</td>
          <td />
        </tr>
        {rows.map((r) => (
          <tr key={r.id} className="h-5 border-b border-rule/60 last:border-0">
            <td className="py-0">
              <span className="sr-only">{t.peaks.lineSr}</span>
              <LineBadge info={lineInfo(r.id)} size="xs" />
            </td>
            <td>{pad(r.stats.peak_hour.hour)}</td>
            <td>{formatPercent(r.stats.peak_hour.share)}</td>
            <td>{formatDecimal(r.stats.peak_to_average_ratio, 2)}</td>
            <td>
              <Sparkline values={r.profile} color={lineInfo(r.id).color} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
