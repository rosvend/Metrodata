import { useMemo, useState } from "react";
import { pageByPath } from "../app/pages";
import { useCurrentTheme } from "../app/themeContext";
import { useFilters } from "../app/useFilters";
import type { KpiReport, PeaksJson, Profiles } from "../data/types";
import { useJson } from "../data/useJson";
import { LineBadge } from "../flow/LineBadge";
import { DAY_TYPES, DAY_TYPE_LABELS, YEAR_COVERAGE, YEARS } from "../lib/filters";
import { KPI_TEXT } from "../lib/kpiText";
import { LINE_IDS, lineInfo } from "../lib/lines";
import { HeatLegend, Heatmap } from "../peaks/Heatmap";
import { LoadPerKm } from "../peaks/LoadPerKm";
import { PeakTable } from "../peaks/PeakTable";
import { Saturation } from "../peaks/Saturation";
import { type HeatMode, heatmapCells, loadRanking, peaksByYear } from "../peaks/shape";
import { DayTypeLegend, SystemProfile } from "../peaks/SystemProfile";
import { ChartCard } from "../ui/ChartCard";
import { PageHeader } from "../ui/PageHeader";
import { Segmented } from "../ui/Segmented";
import { ErrorState, Loading } from "../ui/Status";

const PAGE = pageByPath("/peaks");

export function PeaksPage() {
  const [{ year, dayType }] = useFilters();
  const theme = useCurrentTheme();
  const profiles = useJson<Profiles>("profiles.json");
  const kpis = useJson<KpiReport>("kpis.json");
  const peaks = useJson<PeaksJson>("peaks.json");
  const [mode, setMode] = useState<HeatMode>("share");
  const [satLine, setSatLine] = useState("A");

  const period = String(year);
  const byLine = profiles.status === "ready" ? profiles.data.periods[period]?.[dayType] : undefined;
  const cells = useMemo(() => (byLine ? heatmapCells(byLine, mode) : []), [byLine, mode]);
  const failed = [profiles, kpis, peaks].find((r) => r.status === "error");
  const ready = profiles.status === "ready" && kpis.status === "ready" && peaks.status === "ready";
  const weekdayNote = dayType === "weekday" ? "" : " Weekdays only, by definition.";

  return (
    <div className="mx-auto max-w-[1440px] space-y-3 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title={PAGE.title} lede={PAGE.lede} compact />
        <p className="text-[13px] text-ink-muted">
          {year} covers {YEAR_COVERAGE[year]}. Boardings, not passengers.
        </p>
      </div>

      {failed?.status === "error" && <ErrorState message={failed.error} onRetry={failed.retry} />}
      {!failed && !ready && <Loading label="Loading peak data" />}

      {ready && byLine && (
        <div className="grid gap-3 lg:grid-cols-12">
          <ChartCard
            className="lg:col-span-7"
            title="Line × hour"
            subtitle={`Average ${DAY_TYPE_LABELS[dayType].toLowerCase()}, ${year}`}
            info="Each cell is the mean boardings in that hour band over the operating days of the selected day type. Share mode divides by the line's own daily total, so lines of very different size can be compared."
            controls={
              <div className="flex flex-wrap items-center gap-3">
                <HeatLegend cells={cells} mode={mode} />
                <Segmented<HeatMode>
                  legend="Color shows"
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "share", label: "Share of day" },
                    { value: "absolute", label: "Boardings" },
                  ]}
                />
              </div>
            }
          >
            <Heatmap cells={cells} mode={mode} lines={LINE_IDS} theme={theme} />
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title="System profile by day type"
            subtitle={`All lines, average boardings per hour, ${year}`}
            controls={<DayTypeLegend selected={dayType} />}
          >
            <SystemProfile
              byDayType={
                Object.fromEntries(
                  DAY_TYPES.map((t) => [t, profiles.data.periods[period]?.[t]?.system ?? []]),
                ) as Record<(typeof DAY_TYPES)[number], number[]>
              }
              selected={dayType}
              theme={theme}
            />
          </ChartCard>

          <ChartCard
            className="lg:col-span-4"
            title="Peaks by line"
            subtitle={`${DAY_TYPE_LABELS[dayType]}, ${year}. Click a column to sort.`}
          >
            {kpis.data.day_type_peaks[period]?.[dayType] ? (
              <PeakTable peaks={kpis.data.day_type_peaks[period][dayType]} profiles={byLine} />
            ) : (
              <p className="text-ink-muted">No data for this selection.</p>
            )}
          </ChartCard>

          <ChartCard
            className="lg:col-span-3"
            title="Peak-hour load per km"
            subtitle={`Peak-hour boardings ÷ km, median weekday, ${year}.${weekdayNote}`}
            info={KPI_TEXT.load_per_km}
          >
            <LoadPerKm items={loadRanking(kpis.data.by_year[period]?.lines ?? {})} theme={theme} />
            <p className="mt-1 text-[12px] text-ink-faint">* Hollow: bus corridor, length indicative.</p>
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title="Saturation (proxy)"
            subtitle={`Boardings in each weekday's busiest hour, one dot per day. Solid: median, dashed: P95.${weekdayNote}`}
            info={KPI_TEXT.saturation_index}
          >
            <div className="mb-2 flex flex-wrap gap-1" role="group" aria-label="Line for the saturation view">
              {LINE_IDS.map((id) => {
                const si = kpis.data.by_year[period]?.lines[id]?.saturation_index;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={satLine === id}
                    aria-label={`Line ${lineInfo(id).badge}, saturation index ${si?.toFixed(2) ?? "n/a"}`}
                    onClick={() => setSatLine(id)}
                    className={`flex flex-col items-center rounded-xl px-1 py-1 text-[11px] tabular-nums ${
                      satLine === id ? "bg-surface ring-1 ring-ink/60" : "hover:bg-surface/60"
                    }`}
                  >
                    <LineBadge info={lineInfo(id)} size="sm" />
                    {si?.toFixed(2)}
                  </button>
                );
              })}
            </div>
            <Saturation
              line={satLine}
              points={peaksByYear(peaks.data, satLine)}
              byYear={Object.fromEntries(YEARS.map((y) => [y, kpis.data.by_year[String(y)]?.lines[satLine]]))}
              theme={theme}
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
