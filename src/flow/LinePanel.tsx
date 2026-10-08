import { motion } from "motion/react";
import type { LineKpis } from "../data/types";
import { formatInt, formatPercent } from "../lib/format";
import { KPI_TEXT } from "../lib/kpiText";
import { MODE_LABELS } from "../lib/lines";
import { InfoTip } from "../ui/InfoTip";
import { hourBand } from "./metrics";
import type { FlowLine } from "./model";
import { LineBadge } from "./LineBadge";
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
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-label={`Line ${line.info.badge} details`}
      className="flex max-h-full flex-col overflow-y-auto rounded-card bg-surface p-5 shadow-2xl ring-1 ring-rule"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <LineBadge info={line.info} />
          <div className="leading-tight">
            <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{line.info.name}</h2>
            <p className="text-[13px] text-ink-muted">
              {MODE_LABELS[line.info.mode]}, {line.km.toFixed(1)} km{line.indicative ? " (indicative)" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1 text-[14px] ring-1 ring-ink/70 hover:bg-soft"
          aria-label="Close line details"
        >
          Close
        </button>
      </div>

      <section className="mt-4">
        <h3 className="text-[14px] font-semibold">
          Average hourly boardings, {dayLabel.toLowerCase()} {year}
        </h3>
        <p className="text-[12px] text-ink-faint">
          {year} data covers {coverage}. Marker: {hourBand(hour)}.
        </p>
        <ProfileChart
          values={line.values}
          hour={hour}
          color={line.info.color}
          theme={theme}
          label={`Hourly boardings profile for line ${line.info.badge}`}
        />
        <p className="text-[14px]">
          <span className="font-semibold tabular-nums">{formatInt(line.daily)}</span> boardings on an average{" "}
          {daySingular}.
        </p>
      </section>

      {kpis && (
        <section className="mt-4">
          <h3 className="text-[14px] font-semibold">Weekday indicators, {year}</h3>
          <dl className="mt-1">
            <Row
              label="Weekday boardings"
              value={formatInt(kpis.avg_weekday_boardings)}
              tip={KPI_TEXT.avg_weekday_boardings}
            />
            <Row label="Share of all lines" value={formatPercent(kpis.line_share)} tip={KPI_TEXT.line_share} />
            <Row
              label="Peak hour"
              value={`${pad(kpis.peak_hour_weekday.hour)} (${formatPercent(kpis.peak_hour_weekday.share)})`}
              tip={KPI_TEXT.peak_hour}
            />
            <Row
              label="Peak ÷ average hour"
              value={kpis.peak_to_average_ratio.toFixed(2)}
              tip={KPI_TEXT.peak_to_average}
            />
            <Row
              label="Peak-hour boardings per km"
              value={`${formatInt(kpis.peak_hour_load_per_km)}${kpis.length_indicative ? "*" : ""}`}
              tip={KPI_TEXT.load_per_km}
            />
            <Row
              label="Saturation index (proxy)"
              value={kpis.saturation_index.toFixed(3)}
              tip={KPI_TEXT.saturation_index}
            />
            <Row
              label="Saturday ÷ weekday"
              value={formatPercent(kpis.weekend_ratio.saturday)}
              tip={KPI_TEXT.weekend_ratio}
            />
            <Row label="Sunday & holiday ÷ weekday" value={formatPercent(kpis.weekend_ratio.sunday_holiday)} />
          </dl>
          {kpis.length_indicative && (
            <p className="mt-2 text-[12px] text-ink-faint">* Line length is indicative for bus corridors.</p>
          )}
        </section>
      )}
    </motion.aside>
  );
}
