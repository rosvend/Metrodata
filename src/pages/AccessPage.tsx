import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { buildAccessLayers } from "../access/layers";
import { CoveragePanel } from "../access/CoveragePanel";
import { type WalkResult, walkingTime } from "../access/geometry";
import { barrioKey } from "../access/keys";
import { PointResult } from "../access/PointResult";
import { StationPanel } from "../access/StationPanel";
import { useGrow } from "../access/useGrow";
import { pageByPath } from "../app/pages";
import { useCurrentTheme } from "../app/themeContext";
import type {
  AccessFilter,
  AccessSummary,
  AreaGeometry,
  CoverageGeo,
  FeatureCollection,
  IsochroneStats,
  IsochronesGeo,
  LinesGeo,
  LonLat,
  StationsGeo,
} from "../data/types";
import { useJson } from "../data/useJson";
import { BaseMap } from "../map/BaseMap";
import { useContextLayers } from "../map/context";
import { type FlyTarget, overlayPadding } from "../map/view";
import { parseAccessView, setParam } from "../lib/viewParams";
import { InfoTip } from "../ui/InfoTip";
import { PageHeader } from "../ui/PageHeader";
import { Segmented } from "../ui/Segmented";
import { ErrorState, Loading } from "../ui/Status";

const PAGE = pageByPath("/access");
// Centre of the network, used when nothing specific is selected
const OVERVIEW: [number, number] = [-75.575, 6.245];
type Mode = "station" | "coverage";
type BarriosGeo = FeatureCollection<AreaGeometry, { nombre: string; codigo_comuna: number }>;

const FILTERS: { value: AccessFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "metro", label: "Metro" },
  { value: "tranvia", label: "Tranvía" },
  { value: "metrocable", label: "Metrocable" },
];

const METHOD =
  "Walking areas were computed offline with Valhalla on OpenStreetMap streets at 4.8 km/h, for the 50 main stations (Metro, Tranvía, Metrocable and the main Metroplús stations). They follow streets and paths, not straight lines.";

export function AccessPage() {
  const theme = useCurrentTheme();
  const [params, setParams] = useSearchParams();
  const stations = useJson<StationsGeo>("stations.geojson");
  const lines = useJson<LinesGeo>("lines.geojson");
  const iso = useJson<IsochronesGeo>("isochrones.geojson");
  const stats = useJson<IsochroneStats>("isochrone_stats.json");
  const summary = useJson<AccessSummary>("access.json");
  const context = useContextLayers();
  const view = parseAccessView(params);
  const { mode, filter, overlap: showOverlap } = view;
  const setView = (key: string, value: string | null) => setParams((p) => setParam(p, key, value), { replace: true });
  const setMode = (m: Mode) => setView("mode", m === "station" ? null : m);
  const setFilter = (f: AccessFilter) => setView("filter", f === "all" ? null : f);
  const setShowOverlap = (on: boolean) => setView("overlap", on ? "1" : null);
  const [point, setPoint] = useState<LonLat | null>(null);
  const [barrio, setBarrio] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const coverage = useJson<CoverageGeo>(mode === "coverage" ? "access_coverage.geojson" : null);
  const barrios = useJson<BarriosGeo>(barrio ? "barrios.geojson" : null);

  const stationId = params.get("station");
  const setStation = (id: string | null) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (id) next.set("station", id);
      else next.delete("station");
      return next;
    });
  const grow = useGrow(mode === "station" ? stationId : null);

  const stationsData = stations.status === "ready" ? stations.data : null;
  const tipo1 = useMemo(
    () => (stationsData ? stationsData.features.filter((f) => f.properties.tipo === 1) : []),
    [stationsData],
  );
  // 50 stations: cheap to rebuild each render
  const allowed = new Set(
    tipo1.filter((f) => filter === "all" || f.properties.modes.includes(filter)).map((f) => f.properties.id),
  );
  const names = useMemo(() => new Map(tipo1.map((f) => [f.properties.id, f.properties.name])), [tipo1]);
  const selected = tipo1.find((f) => f.properties.id === stationId) ?? null;
  const barrioFeature =
    barrio && barrios.status === "ready"
      ? (barrios.data.features.find((f) => barrioKey(f.properties.codigo_comuna, f.properties.nombre) === barrio) ??
        null)
      : null;

  // Fly to what was picked; leave room for the side panel and controls on large screens
  const wide = typeof matchMedia === "function" && matchMedia("(min-width: 1024px)").matches;
  const flyPadding = wide ? { top: 40, bottom: 150, left: 40, right: 440 } : undefined;
  const flyTo = useMemo<FlyTarget | null>(() => {
    if (barrioFeature) {
      const ring =
        barrioFeature.geometry.type === "Polygon"
          ? barrioFeature.geometry.coordinates[0]
          : barrioFeature.geometry.coordinates[0]?.[0];
      const pts = ring ?? [];
      const center: [number, number] = [
        pts.reduce((s, p) => s + p[0], 0) / Math.max(pts.length, 1),
        pts.reduce((s, p) => s + p[1], 0) / Math.max(pts.length, 1),
      ];
      return { center, zoom: 14.2, ...(flyPadding ? { padding: flyPadding } : {}) };
    }
    if (mode === "coverage" || !selected)
      return { center: OVERVIEW, zoom: 11.6, ...(flyPadding ? { padding: flyPadding } : {}) };
    return { center: selected.geometry.coordinates, zoom: 14, ...(flyPadding ? { padding: flyPadding } : {}) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barrioFeature, mode, selected?.properties.id]);

  const ready =
    stations.status === "ready" &&
    lines.status === "ready" &&
    iso.status === "ready" &&
    stats.status === "ready" &&
    summary.status === "ready";
  const failed = [stations, lines, iso, stats, summary, coverage].find((r) => r.status === "error");
  const walk: WalkResult | null = point && iso.status === "ready" ? walkingTime(point, iso.data, allowed) : null;

  const layers =
    ready && lines.status === "ready" && iso.status === "ready"
      ? buildAccessLayers({
          mode,
          filter,
          allowed,
          stations: tipo1,
          lines: lines.data,
          iso: iso.data,
          coverage: coverage.status === "ready" ? coverage.data : null,
          showOverlap,
          selected,
          grow,
          point,
          barrio: barrioFeature,
          theme,
          onStation: (id) => {
            setMode("station");
            setStation(id);
          },
        })
      : [];

  const pickStation = (name: string) => {
    const hit = tipo1.find((f) => f.properties.name.toLowerCase() === name.trim().toLowerCase());
    if (hit) {
      setMode("station");
      setStation(hit.properties.id);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:relative lg:block lg:h-full lg:p-4">
      <div className="lg:absolute lg:top-8 lg:left-8 lg:z-10 lg:max-w-[380px] lg:rounded-card lg:bg-surface/95 lg:px-6 lg:py-5 lg:shadow-xl lg:ring-1 lg:ring-rule">
        <PageHeader title={PAGE.title} lede={PAGE.lede} compact />
      </div>

      {failed?.status === "error" && <ErrorState message={failed.error} onRetry={failed.retry} />}
      {!failed && !ready && <Loading label="Loading walking areas" />}

      {ready && stats.status === "ready" && summary.status === "ready" && iso.status === "ready" && (
        <>
          <section
            aria-label="Access map"
            className="relative h-[62vh] min-h-[380px] overflow-hidden rounded-card bg-soft ring-1 ring-rule lg:absolute lg:inset-4 lg:h-auto"
          >
            {mapError ? (
              <div className="p-6">
                <ErrorState message={`The map could not be drawn: ${mapError}`} />
              </div>
            ) : (
              <BaseMap
                bounds={[
                  [-75.66, 6.15],
                  [-75.49, 6.34],
                ]}
                padding={overlayPadding(140)}
                layers={layers}
                context={context}
                theme={theme}
                onClick={(info) => {
                  if (info.object || !info.coordinate) return;
                  setPoint([info.coordinate[0] ?? 0, info.coordinate[1] ?? 0]);
                }}
                onError={setMapError}
                flyTo={flyTo}
              />
            )}
          </section>

          <div
            data-surface="panel"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card bg-panel px-5 py-4 text-panel-ink shadow-2xl lg:absolute lg:bottom-8 lg:left-8 lg:z-10 lg:max-w-[calc(100%-480px)]"
          >
            <Segmented<Mode>
              tone="panel"
              legend="Show"
              value={mode}
              onChange={setMode}
              options={[
                { value: "station", label: "One station" },
                { value: "coverage", label: "Coverage" },
              ]}
            />
            <Segmented<AccessFilter>
              tone="panel"
              legend="Stations"
              value={filter}
              onChange={setFilter}
              options={FILTERS}
            />
            {mode === "coverage" && (
              <label className="flex cursor-pointer items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={showOverlap}
                  onChange={(e) => setShowOverlap(e.target.checked)}
                  className="size-4 accent-[var(--metro-green)]"
                />
                Show overlap
              </label>
            )}
            <label className="flex items-center gap-2 text-[14px]">
              <span className="text-[13px] text-panel-muted">Find a station</span>
              <input
                list="access-stations"
                onChange={(e) => pickStation(e.target.value)}
                placeholder="e.g. Poblado"
                className="w-40 rounded-full bg-white/10 px-3 py-1.5 text-[14px] text-panel-ink ring-1 ring-white/15 placeholder:text-panel-muted"
              />
              <datalist id="access-stations">
                {[...allowed].map((id) => (
                  <option key={id} value={names.get(id)} />
                ))}
              </datalist>
            </label>
            <span className="flex items-center gap-2 text-[13px] text-panel-muted">
              Click anywhere on the map to check the walk.
              <InfoTip tone="panel" placement="above" label="how walking areas were computed" text={METHOD} />
            </span>
          </div>

          <aside
            aria-label="Details"
            className="flex flex-col gap-3 rounded-card bg-soft p-5 ring-1 ring-rule lg:absolute lg:top-8 lg:right-8 lg:bottom-8 lg:z-10 lg:w-[420px] lg:overflow-hidden lg:shadow-xl"
          >
            {point && <PointResult point={point} result={walk} onClear={() => setPoint(null)} />}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {mode === "coverage" ? (
                <CoveragePanel filter={filter} summary={summary.data} selectedBarrio={barrio} onBarrio={setBarrio} />
              ) : selected ? (
                <StationPanel
                  station={selected}
                  iso={iso.data}
                  stats={stats.data.stations.find((s) => s.station_id === selected.properties.id)}
                  nearest={summary.data.nearest[selected.properties.id] ?? []}
                  names={names}
                  onStation={setStation}
                />
              ) : (
                <div className="space-y-2 text-[15px] text-ink-muted">
                  <h2 className="text-[20px] font-semibold text-ink">Pick a station</h2>
                  <p>
                    Click a station on the map, or use Find a station, to see how far you can walk from it in 5, 10 and
                    15 minutes.
                  </p>
                  <p>Switch to Coverage to see the walking time to the nearest station across the city.</p>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
