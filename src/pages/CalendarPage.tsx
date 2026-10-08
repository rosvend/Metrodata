import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useCurrentTheme } from "../app/themeContext";
import { useFilters } from "../app/useFilters";
import { CalendarHeatmap } from "../calendar/CalendarHeatmap";
import { SPIKE_RANGE } from "../calendar/colors";
import { DayDetail } from "../calendar/DayDetail";
import { RankedDays } from "../calendar/RankedDays";
import { calendarCells, hourlyYoY, monthlyYoY, rankDays } from "../calendar/shape";
import { HourlyTrend, MonthlyTrend } from "../calendar/Trend";
import type { DailyTotals, KpiReport, Profiles, SpikeProfiles, SpikesJson } from "../data/types";
import { useJson } from "../data/useJson";
import { dateForYear, parseDate, withDate } from "../lib/dateParam";
import { useT } from "../i18n/lang";
import { formatPercent } from "../lib/format";
import { ChartCard } from "../ui/ChartCard";
import { PageHeader } from "../ui/PageHeader";
import { Segmented } from "../ui/Segmented";
import { ErrorState, Loading } from "../ui/Status";

const COVERAGE: Record<number, [string, string]> = {
  2024: ["2024-01-01", "2024-12-31"],
  2025: ["2025-01-01", "2025-09-30"],
  2026: ["2026-01-01", "2026-07-31"],
};

export function CalendarPage() {
  const t = useT();
  const page = t.pages["/calendar"];
  const c = t.calendar;
  const [{ year, dayType }] = useFilters();
  const [params, setParams] = useSearchParams();
  const theme = useCurrentTheme();
  const spikes = useJson<SpikesJson>("spikes.json");
  const daily = useJson<DailyTotals>("daily_totals.json");
  const kpis = useJson<KpiReport>("kpis.json");
  const profiles = useJson<Profiles>("profiles.json");
  const dayProfiles = useJson<SpikeProfiles>("spike_profiles.json");
  const [trend, setTrend] = useState<"monthly" | "hourly">("monthly");

  const ready =
    spikes.status === "ready" &&
    daily.status === "ready" &&
    kpis.status === "ready" &&
    profiles.status === "ready" &&
    dayProfiles.status === "ready";
  const failed = [spikes, daily, kpis, profiles, dayProfiles].find((r) => r.status === "error");

  const cells = useMemo(
    () =>
      spikes.status === "ready" && daily.status === "ready"
        ? calendarCells(spikes.data, daily.data, year, COVERAGE[year] ?? ["", ""])
        : [],
    [spikes, daily, year],
  );
  const ranked = useMemo(
    () => (spikes.status === "ready" ? rankDays(spikes.data, year, 5) : { spikes: [], dips: [] }),
    [spikes, year],
  );
  const fromUrl = parseDate(params);
  const hasYear = params.has("year");
  // A shared link with only ?date= adopts that date's year
  useEffect(() => {
    if (fromUrl && !hasYear) setParams((p) => withDate(p, fromUrl), { replace: true });
  }, [fromUrl, hasYear, setParams]);
  const selected = dateForYear(fromUrl, year) ?? ranked.spikes[0]?.date ?? null;
  const select = (date: string) => setParams((p) => withDate(p, date));

  return (
    <div className="mx-auto max-w-[1440px] space-y-3 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title={page.title} lede={page.lede} compact />
        <p className="max-w-[46ch] text-right text-[13px] text-ink-muted">{c.coreNote}</p>
      </div>

      {failed?.status === "error" && <ErrorState message={failed.error} onRetry={failed.retry} />}
      {!failed && !ready && <Loading label={c.loading} />}

      {ready && (
        <div className="grid gap-3 lg:grid-cols-12">
          <ChartCard
            className="lg:col-span-12"
            title={c.yearTitle(year)}
            subtitle={c.yearSubtitle(t.filters.coverage[year])}
            info={c.info}
            controls={
              <div className="flex items-center gap-2 text-[12px] text-ink-muted" aria-label={c.legendLabel}>
                <span>{c.legendLow}</span>
                <span
                  aria-hidden
                  className="h-2.5 w-28 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${SPIKE_RANGE.join(", ")})` }}
                />
                <span>{c.legendHigh}</span>
              </div>
            }
          >
            <CalendarHeatmap
              cells={cells}
              spikes={spikes.data}
              daily={daily.data}
              selected={selected}
              onSelect={select}
              theme={theme}
            />
          </ChartCard>

          <ChartCard className="lg:col-span-4" title={c.rankedTitle} subtitle={c.rankedSubtitle(year)}>
            <RankedDays ranked={ranked} spikes={spikes.data} selected={selected} onSelect={select} />
          </ChartCard>

          <ChartCard
            className="lg:col-span-4"
            title={c.dayTitle}
            controls={
              <label className="flex items-center gap-2 text-[13px] text-ink-muted">
                {c.goToDate}
                <input
                  type="date"
                  min={COVERAGE[year]?.[0]}
                  max={COVERAGE[year]?.[1]}
                  value={selected ?? ""}
                  onChange={(e) => e.target.value && select(e.target.value)}
                  className="rounded-full bg-surface px-3 py-1 text-[13px] text-ink ring-1 ring-rule"
                />
              </label>
            }
          >
            {selected ? (
              <DayDetail date={selected} spikes={spikes.data} profiles={dayProfiles.data} theme={theme} />
            ) : (
              <p className="text-ink-muted">{c.pickDay}</p>
            )}
          </ChartCard>

          <ChartCard
            className="lg:col-span-4"
            title={c.trendTitle}
            subtitle={c.lflNote}
            controls={
              <Segmented<"monthly" | "hourly">
                legend={c.view}
                value={trend}
                onChange={setTrend}
                options={[
                  { value: "monthly", label: c.byMonth },
                  { value: "hourly", label: c.byHour },
                ]}
              />
            }
          >
            <p className="mb-1 text-[13px]">
              {c.lflHeadline}{" "}
              {Object.entries(kpis.data.like_for_like_growth).map(([y, g], k) => (
                <span key={y} className="font-semibold tabular-nums">
                  {k > 0 ? ", " : ""}
                  {c.lflPair(y, g.vs, formatPercent(g.system, { signed: true }))}
                </span>
              ))}
            </p>
            {trend === "monthly" ? (
              <MonthlyTrend rows={monthlyYoY(kpis.data.monthly)} theme={theme} />
            ) : (
              <>
                <p className="text-[12px] text-ink-muted">{c.hourlyNote(t.filters.dayPlural[dayType])}</p>
                <HourlyTrend
                  rows={hourlyYoY(
                    profiles.data.periods["2025_jan_jul"]?.[dayType]?.system ?? [],
                    profiles.data.periods["2026_jan_jul"]?.[dayType]?.system ?? [],
                  )}
                  theme={theme}
                />
              </>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
