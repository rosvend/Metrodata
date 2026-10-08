import { useMemo, useState } from "react";
import { useCurrentTheme } from "../app/themeContext";
import { useFilters } from "../app/useFilters";
import type { KpiReport, PeaksJson, Profiles } from "../data/types";
import { useJson } from "../data/useJson";
import { LineBadge } from "../flow/LineBadge";
import { useT } from "../i18n/lang";
import { DAY_TYPES, YEARS } from "../lib/filters";
import { formatDecimal } from "../lib/format";
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

export function PeaksPage() {
  const t = useT();
  const page = t.pages["/peaks"];
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
  const weekdayNote = dayType === "weekday" ? "" : t.peaks.weekdaysOnly;
  const dayPlural = t.filters.dayPlural[dayType];

  return (
    <div className="mx-auto max-w-[1440px] space-y-3 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title={page.title} lede={page.lede} compact />
        <p className="text-[13px] text-ink-muted">{t.peaks.coverageNote(year, t.filters.coverage[year])}</p>
      </div>

      {failed?.status === "error" && <ErrorState message={failed.error} onRetry={failed.retry} />}
      {!failed && !ready && <Loading label={t.peaks.loading} />}

      {ready && byLine && (
        <div className="grid gap-3 lg:grid-cols-12">
          <ChartCard
            className="lg:col-span-7"
            title={t.peaks.heatTitle}
            subtitle={t.peaks.heatSubtitle(dayPlural.toLowerCase(), year)}
            info={t.peaks.heatInfo}
            controls={
              <div className="flex flex-wrap items-center gap-3">
                <HeatLegend cells={cells} mode={mode} />
                <Segmented<HeatMode>
                  legend={t.peaks.colorShows}
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "share", label: t.peaks.shareOfDay },
                    { value: "absolute", label: t.peaks.boardings },
                  ]}
                />
              </div>
            }
          >
            <Heatmap cells={cells} mode={mode} lines={LINE_IDS} theme={theme} />
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title={t.peaks.profileTitle}
            subtitle={t.peaks.profileSubtitle(year)}
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
            title={t.peaks.tableTitle}
            subtitle={t.peaks.tableSubtitle(dayPlural, year)}
          >
            {kpis.data.day_type_peaks[period]?.[dayType] ? (
              <PeakTable peaks={kpis.data.day_type_peaks[period][dayType]} profiles={byLine} />
            ) : (
              <p className="text-ink-muted">{t.peaks.noData}</p>
            )}
          </ChartCard>

          <ChartCard
            className="lg:col-span-3"
            title={t.peaks.loadTitle}
            subtitle={t.peaks.loadSubtitle(year) + weekdayNote}
            info={t.kpi.load_per_km}
          >
            <LoadPerKm items={loadRanking(kpis.data.by_year[period]?.lines ?? {})} theme={theme} />
            <p className="mt-1 text-[12px] text-ink-faint">{t.peaks.hollowNote}</p>
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title={t.peaks.satTitle}
            subtitle={t.peaks.satSubtitle + weekdayNote}
            info={t.kpi.saturation_index}
          >
            <div className="mb-2 flex flex-wrap gap-1" role="group" aria-label={t.peaks.satPicker}>
              {LINE_IDS.map((id) => {
                const si = kpis.data.by_year[period]?.lines[id]?.saturation_index;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={satLine === id}
                    aria-label={t.peaks.satButton(lineInfo(id).badge, si === undefined ? "–" : formatDecimal(si, 2))}
                    onClick={() => setSatLine(id)}
                    className={`flex flex-col items-center rounded-xl px-1 py-1 text-[11px] tabular-nums ${
                      satLine === id ? "bg-surface ring-1 ring-ink/60" : "hover:bg-surface/60"
                    }`}
                  >
                    <LineBadge info={lineInfo(id)} size="sm" />
                    {si === undefined ? "" : formatDecimal(si, 2)}
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
