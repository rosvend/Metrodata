import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { pageByPath } from "../app/pages";
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
import { DAY_TYPE_LABELS, YEAR_COVERAGE } from "../lib/filters";
import { formatPercent } from "../lib/format";
import { ChartCard } from "../ui/ChartCard";
import { PageHeader } from "../ui/PageHeader";
import { Segmented } from "../ui/Segmented";
import { ErrorState, Loading } from "../ui/Status";

const PAGE = pageByPath("/calendar");
const COVERAGE: Record<number, [string, string]> = {
  2024: ["2024-01-01", "2024-12-31"],
  2025: ["2025-01-01", "2025-09-30"],
  2026: ["2026-01-01", "2026-07-31"],
};
const LFL_NOTE = "Like-for-like: January–July only, because October–December 2025 is missing and 2026 ends in July.";

export function CalendarPage() {
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
        <PageHeader title={PAGE.title} lede={PAGE.lede} compact />
        <p className="max-w-[46ch] text-right text-[13px] text-ink-muted">
          Core lines A, B, T-A, 1, 2, O and P. Each day is compared with the same weekday and day type within ±35 days.
        </p>
      </div>

      {failed?.status === "error" && <ErrorState message={failed.error} onRetry={failed.retry} />}
      {!failed && !ready && <Loading label="Loading the calendar" />}

      {ready && (
        <div className="grid gap-3 lg:grid-cols-12">
          <ChartCard
            className="lg:col-span-12"
            title={`${year}, day by day`}
            subtitle={`Data covers ${YEAR_COVERAGE[year]}. Click a day to see its hours. All day types are shown: each is compared only with its own kind.`}
            info="Deviation = core-line boardings ÷ expected − 1. Expected is the median of the same weekday and day type within ±35 days, excluding the day itself. Grey outline: too few comparable days (left blank). Dashed red: excluded day (probable logging failure). Empty: no data in the source."
            controls={
              <div className="flex items-center gap-2 text-[12px] text-ink-muted" aria-label="Color legend">
                <span>−40% or less</span>
                <span
                  aria-hidden
                  className="h-2.5 w-28 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${SPIKE_RANGE.join(", ")})` }}
                />
                <span>+40% or more</span>
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

          <ChartCard
            className="lg:col-span-4"
            title="Biggest spikes and dips"
            subtitle={`${year}. Drivers are hypotheses to verify, not causes.`}
          >
            <RankedDays ranked={ranked} spikes={spikes.data} selected={selected} onSelect={select} />
          </ChartCard>

          <ChartCard className="lg:col-span-4" title="The day against its expected hours">
            {selected ? (
              <DayDetail date={selected} spikes={spikes.data} profiles={dayProfiles.data} theme={theme} />
            ) : (
              <p className="text-ink-muted">Pick a day in the calendar or the list.</p>
            )}
          </ChartCard>

          <ChartCard
            className="lg:col-span-4"
            title="Like-for-like trend"
            subtitle={LFL_NOTE}
            controls={
              <Segmented<"monthly" | "hourly">
                legend="View"
                value={trend}
                onChange={setTrend}
                options={[
                  { value: "monthly", label: "By month" },
                  { value: "hourly", label: "By hour" },
                ]}
              />
            }
          >
            <p className="mb-1 text-[13px]">
              Mean daily boardings, Jan–Jul:{" "}
              {Object.entries(kpis.data.like_for_like_growth).map(([y, g], k) => (
                <span key={y} className="font-semibold tabular-nums">
                  {k > 0 ? ", " : ""}
                  {y} vs {g.vs} {formatPercent(g.system, { signed: true })}
                </span>
              ))}
            </p>
            {trend === "monthly" ? (
              <MonthlyTrend rows={monthlyYoY(kpis.data.monthly)} theme={theme} />
            ) : (
              <>
                <p className="text-[12px] text-ink-muted">
                  {DAY_TYPE_LABELS[dayType]}, average boardings per hour band, 2026 vs 2025. After 22:00 the base is
                  tiny, so percentages swing widely.
                </p>
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
