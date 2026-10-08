import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { pageByPath } from "../app/pages";
import { useCurrentTheme } from "../app/themeContext";
import { useFilters } from "../app/useFilters";
import type { FeedersGeo, KpiReport, LinesGeo, Profiles, StationProps, StationsGeo } from "../data/types";
import { useJson } from "../data/useJson";
import { FlowMap, type Hover } from "../flow/FlowMap";
import { LineLegend } from "../flow/LineLegend";
import { LinePanel } from "../flow/LinePanel";
import { type Metric, metricMax } from "../flow/metrics";
import { buildFlowLines } from "../flow/model";
import { PlaybackBar } from "../flow/PlaybackBar";
import { Tooltip } from "../flow/Tooltip";
import { usePlayback } from "../flow/usePlayback";
import { DAY_TYPE_LABELS, DAY_TYPE_SINGULAR, YEAR_COVERAGE } from "../lib/filters";
import { PageHeader } from "../ui/PageHeader";
import { ErrorState, Loading } from "../ui/Status";

const PAGE = pageByPath("/");
// Opens on the system's weekday peak hour (17:00) so the first view shows the busiest network
const START_HOUR = 17;

export function FlowPage() {
  const [{ year, dayType }] = useFilters();
  const theme = useCurrentTheme();
  const profiles = useJson<Profiles>("profiles.json");
  const lines = useJson<LinesGeo>("lines.geojson");
  const stations = useJson<StationsGeo>("stations.geojson");
  const kpis = useJson<KpiReport>("kpis.json");
  const [showFeeders, setShowFeeders] = useState(false);
  const feeders = useJson<FeedersGeo>(showFeeders ? "feeders.geojson" : null);
  const [metric, setMetric] = useState<Metric>("boardings");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const playback = usePlayback(START_HOUR);

  const model = useMemo(
    () =>
      profiles.status === "ready" && lines.status === "ready"
        ? buildFlowLines(lines.data, profiles.data, String(year), dayType)
        : null,
    [profiles, lines, year, dayType],
  );
  const max = useMemo(() => (model ? metricMax(model.flow, metric) : 0), [model, metric]);
  const stationIndex = useMemo(
    () =>
      new Map<string, StationProps>(
        stations.status === "ready" ? stations.data.features.map((f) => [f.properties.id, f.properties]) : [],
      ),
    [stations],
  );

  const failed = [profiles, lines].find((r) => r.status === "error");
  const selectedLine = model?.flow.find((l) => l.id === selected);
  const context = `average ${DAY_TYPE_SINGULAR[dayType]}, ${year}`;

  return (
    <div className="space-y-6">
      <PageHeader title={PAGE.title} lede={PAGE.lede} />

      {failed?.status === "error" && <ErrorState message={failed.error} onRetry={failed.retry} />}
      {!failed && !model && <Loading label="Loading the network" />}

      {model && (
        <section
          aria-label="Flow map"
          className="overflow-hidden rounded-card bg-panel ring-1 ring-rule"
          data-surface="panel"
        >
          <div className="relative h-[62vh] min-h-[420px] bg-soft lg:h-[calc(100vh-330px)] lg:min-h-[520px]">
            {mapError ? (
              <div className="p-6">
                <ErrorState message={`The map could not be drawn: ${mapError}`} />
              </div>
            ) : (
              <FlowMap
                flow={model.flow}
                noData={model.noData}
                stations={stations.status === "ready" ? stations.data : null}
                feeders={feeders.status === "ready" ? feeders.data : null}
                t={playback.t}
                clock={playback.clock}
                metric={metric}
                max={max}
                selected={selected}
                theme={theme}
                onSelect={setSelected}
                onHover={setHover}
                onError={setMapError}
              />
            )}
            {hover && (
              <Tooltip
                hover={hover}
                flow={model.flow}
                noData={model.noData.map((f) => f.properties)}
                stations={stationIndex}
                t={playback.t}
                metric={metric}
                context={context}
              />
            )}
            <AnimatePresence>
              {selectedLine && (
                <div className="absolute inset-y-3 right-3 z-10 hidden w-[380px] md:block">
                  <LinePanel
                    key={selectedLine.id}
                    line={selectedLine}
                    kpis={kpis.status === "ready" ? kpis.data.by_year[String(year)]?.lines[selectedLine.id] : undefined}
                    hour={playback.t}
                    year={year}
                    coverage={YEAR_COVERAGE[year]}
                    dayLabel={DAY_TYPE_LABELS[dayType]}
                    daySingular={DAY_TYPE_SINGULAR[dayType]}
                    theme={theme}
                    onClose={() => setSelected(null)}
                  />
                </div>
              )}
            </AnimatePresence>
            {feeders.status === "loading" && (
              <div className="absolute top-3 left-3 rounded-full bg-surface px-3 py-1 text-[13px] shadow">
                Loading feeder routes…
              </div>
            )}
          </div>

          <div className="space-y-5 px-4 py-5 sm:px-6">
            <PlaybackBar
              playback={playback}
              metric={metric}
              onMetric={setMetric}
              showFeeders={showFeeders}
              onFeeders={setShowFeeders}
            />
            <LineLegend flow={model.flow} t={playback.t} metric={metric} selected={selected} onSelect={setSelected} />
            <p className="text-[12px] text-panel-muted">
              Line width and brightness show{" "}
              {metric === "boardings"
                ? "boardings per hour"
                : metric === "per_km"
                  ? "boardings per hour per km of line"
                  : "each line's share of its own daily boardings"}
              , {context} ({YEAR_COVERAGE[year]}). Moving dots are proportional to that value; they are not vehicles.
              Ridership is recorded per line, so stations show location only. Dashed: Línea O planned alignment; grey
              dashed: Cable Palmitas, no data.
            </p>
          </div>
        </section>
      )}

      {selectedLine && (
        <div className="md:hidden">
          <LinePanel
            line={selectedLine}
            kpis={kpis.status === "ready" ? kpis.data.by_year[String(year)]?.lines[selectedLine.id] : undefined}
            hour={playback.t}
            year={year}
            coverage={YEAR_COVERAGE[year]}
            dayLabel={DAY_TYPE_LABELS[dayType]}
            daySingular={DAY_TYPE_SINGULAR[dayType]}
            theme={theme}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
