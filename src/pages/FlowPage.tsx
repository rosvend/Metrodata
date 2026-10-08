import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { pageByPath } from "../app/pages";
import { useCurrentTheme } from "../app/themeContext";
import { useFilters } from "../app/useFilters";
import type { FeedersGeo, KpiReport, LinesGeo, Profiles, StationProps, StationsGeo } from "../data/types";
import { useJson } from "../data/useJson";
import { useContextLayers } from "../flow/context";
import { FlowMap, type Hover } from "../flow/FlowMap";
import { LineLegend } from "../flow/LineLegend";
import { LinePanel } from "../flow/LinePanel";
import { type Metric, metricMax } from "../flow/metrics";
import { buildFlowLines } from "../flow/model";
import { PlaybackBar } from "../flow/PlaybackBar";
import { Tooltip } from "../flow/Tooltip";
import { usePlayback } from "../flow/usePlayback";
import { DAY_TYPE_LABELS, DAY_TYPE_SINGULAR, YEAR_COVERAGE } from "../lib/filters";
import { InfoTip } from "../ui/InfoTip";
import { PageHeader } from "../ui/PageHeader";
import { ErrorState, Loading } from "../ui/Status";

const PAGE = pageByPath("/");
// Opens on the system's weekday peak hour (17:00) so the first view shows the busiest network
const START_HOUR = 17;

const METRIC_SENTENCE: Record<Metric, string> = {
  boardings: "boardings per hour",
  per_km: "boardings per hour per km of line",
  share: "each line's share of its own daily boardings",
};

export function FlowPage() {
  const [{ year, dayType }] = useFilters();
  const theme = useCurrentTheme();
  const profiles = useJson<Profiles>("profiles.json");
  const lines = useJson<LinesGeo>("lines.geojson");
  const stations = useJson<StationsGeo>("stations.geojson");
  const kpis = useJson<KpiReport>("kpis.json");
  const context = useContextLayers();
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
  const contextText = `average ${DAY_TYPE_SINGULAR[dayType]}, ${year}`;
  const panelProps = selectedLine && {
    line: selectedLine,
    kpis: kpis.status === "ready" ? kpis.data.by_year[String(year)]?.lines[selectedLine.id] : undefined,
    hour: playback.t,
    year,
    coverage: YEAR_COVERAGE[year],
    dayLabel: DAY_TYPE_LABELS[dayType],
    daySingular: DAY_TYPE_SINGULAR[dayType],
    theme,
    onClose: () => setSelected(null),
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:relative lg:block lg:h-full lg:p-4">
      <div className="lg:absolute lg:top-8 lg:left-8 lg:z-10 lg:max-w-[400px] lg:rounded-card lg:bg-surface/95 lg:px-6 lg:py-5 lg:shadow-xl lg:ring-1 lg:ring-rule">
        <PageHeader title={PAGE.title} lede={PAGE.lede} compact />
      </div>

      {failed?.status === "error" && <ErrorState message={failed.error} onRetry={failed.retry} />}
      {!failed && !model && <Loading label="Loading the network" />}

      {model && (
        <>
          <section
            aria-label="Flow map"
            className="relative h-[62vh] min-h-[380px] overflow-hidden rounded-card bg-soft ring-1 ring-rule lg:absolute lg:inset-4 lg:h-auto"
          >
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
                context={context}
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
                context={contextText}
              />
            )}
            {feeders.status === "loading" && (
              <div className="absolute top-3 right-3 rounded-full bg-surface px-3 py-1 text-[13px] shadow">
                Loading feeder routes…
              </div>
            )}
          </section>

          <div
            data-surface="panel"
            className={`space-y-4 rounded-card bg-panel px-4 py-4 shadow-2xl sm:px-5 lg:absolute lg:bottom-8 lg:left-8 lg:z-10 lg:transition-[right] ${
              selectedLine ? "lg:right-[428px]" : "lg:right-8"
            }`}
          >
            <PlaybackBar
              playback={playback}
              metric={metric}
              onMetric={setMetric}
              showFeeders={showFeeders}
              onFeeders={setShowFeeders}
            />
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <LineLegend
                  flow={model.flow}
                  t={playback.t}
                  metric={metric}
                  selected={selected}
                  onSelect={setSelected}
                />
              </div>
              <InfoTip
                tone="panel"
                placement="above"
                label="this map"
                text={`Line width and brightness show ${METRIC_SENTENCE[metric]}, ${contextText} (${YEAR_COVERAGE[year]}). Moving dots are proportional to that value; they are not vehicles. Ridership is recorded per line, so stations show location only. Dashed: Línea O planned alignment (indicative). Grey dashed: Cable Palmitas, no data. Shaded: outside the Valle de Aburrá metro area.`}
              />
            </div>
          </div>

          <AnimatePresence>
            {panelProps && (
              <div className="lg:absolute lg:top-8 lg:right-8 lg:bottom-8 lg:z-10 lg:w-[400px]">
                <LinePanel key={panelProps.line.id} {...panelProps} />
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
