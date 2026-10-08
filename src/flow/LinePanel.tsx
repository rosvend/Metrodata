import { motion } from "motion/react";
import type { LineKpis } from "../data/types";
import { useT } from "../i18n/lang";
import { formatDecimal, formatInt, formatPercent } from "../lib/format";
import { MODE_LABELS } from "../lib/lines";
import { InfoTip } from "../ui/InfoTip";
import { LineBadge } from "./LineBadge";
import { hourBand } from "./metrics";
import type { FlowLine } from "./model";
import { ProfileChart } from "./ProfileChart";

interface Props {
  line: FlowLine;
  kpis: LineKpis | undefined;
  hour: number;
  year: number;
  coverage: string;
  dayLabel: string;
  daySingular: string;
  theme: string;
  onClose: () => void;
}

function Row({ label, value, tip }: { label: string; value: string; tip?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule py-2 last:border-0">
      <dt className="flex items-center gap-1.5 text-[14px] text-ink-muted">
        {label}
        {tip && <InfoTip label={label.toLowerCase()} text={tip} />}
      </dt>
      <dd className="text-[15px] font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function LinePanel({ line, kpis, hour, year, coverage, dayLabel, daySingular, theme, onClose }: Props) {
  const t = useT();
  const p = t.flow.panel;
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-label={p.details(line.info.badge)}
      className="flex max-h-full flex-col overflow-y-auto rounded-card bg-surface p-5 shadow-2xl ring-1 ring-rule"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <LineBadge info={line.info} />
          <div className="leading-tight">
            <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{line.info.name}</h2>
            <p className="text-[13px] text-ink-muted">
              {MODE_LABELS[line.info.mode]}, {formatDecimal(line.km, 1)} km{line.indicative ? p.indicative : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1 text-[14px] ring-1 ring-ink/70 hover:bg-soft"
          aria-label={p.closeDetails}
        >
          {t.common.close}
        </button>
      </div>

      <section className="mt-4">
        <h3 className="text-[14px] font-semibold">{p.profileTitle(dayLabel.toLowerCase(), year)}</h3>
        <p className="text-[12px] text-ink-faint">{p.coverageNote(year, coverage, hourBand(hour))}</p>
        <ProfileChart
          values={line.values}
          hour={hour}
          color={line.info.color}
          theme={theme}
          label={p.profileLabel(line.info.badge)}
          yLabel={p.yAxis}
        />
        <p className="text-[14px]">{p.daily(formatInt(line.daily), daySingular)}</p>
      </section>

      {kpis && (
        <section className="mt-4">
          <h3 className="text-[14px] font-semibold">{p.indicatorsTitle(year)}</h3>
          <dl className="mt-1">
            <Row
              label={p.weekdayBoardings}
              value={formatInt(kpis.avg_weekday_boardings)}
              tip={t.kpi.avg_weekday_boardings}
            />
            <Row label={p.share} value={formatPercent(kpis.line_share)} tip={t.kpi.line_share} />
            <Row
              label={p.peakHour}
              value={`${pad(kpis.peak_hour_weekday.hour)} (${formatPercent(kpis.peak_hour_weekday.share)})`}
              tip={t.kpi.peak_hour}
            />
            <Row
              label={p.peakToAverage}
              value={formatDecimal(kpis.peak_to_average_ratio, 2)}
              tip={t.kpi.peak_to_average}
            />
            <Row
              label={p.loadPerKm}
              value={`${formatInt(kpis.peak_hour_load_per_km)}${kpis.length_indicative ? "*" : ""}`}
              tip={t.kpi.load_per_km}
            />
            <Row label={p.saturation} value={formatDecimal(kpis.saturation_index, 3)} tip={t.kpi.saturation_index} />
            <Row label={p.saturday} value={formatPercent(kpis.weekend_ratio.saturday)} tip={t.kpi.weekend_ratio} />
            <Row label={p.sunday} value={formatPercent(kpis.weekend_ratio.sunday_holiday)} />
          </dl>
          {kpis.length_indicative && <p className="mt-2 text-[12px] text-ink-faint">{p.indicativeNote}</p>}
        </section>
      )}
    </motion.aside>
  );
}
