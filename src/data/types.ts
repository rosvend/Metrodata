export interface ExcludedDate {
  date: string;
  reason: string;
  system_boardings: number;
}

export interface FileReport {
  file: string;
  rows: number;
  total_boardings: number;
  coverage: [string, string];
  missing_dates: string[];
}

export interface IsochroneSource {
  osm: { source_url: string; osm_data_timestamp: string };
  valhalla_version: string;
  walking_speed_kmh: number;
  stations_requested: number;
  stations_ok: number;
}

export interface DataQuality {
  generated_at: string;
  files: Record<string, FileReport>;
  reconciliation: { "2026_matches": boolean; hour_sum_mismatches: number; duplicate_line_days: number };
  excluded_dates: ExcludedDate[];
  spike_index: { insufficient_baseline_days: number };
  isochrones: { source: IsochroneSource; failures: { station_id: string; reason: string }[] } | string;
}

export type DayTypeKey = "weekday" | "saturday" | "sunday_holiday";

export interface Profiles {
  hours: number[];
  periods: Record<string, Record<DayTypeKey, Record<string, number[]>>>;
}

export interface LineKpis {
  operating_days: number;
  avg_daily_boardings: number;
  avg_weekday_boardings: number;
  weekend_ratio: { saturday: number; sunday_holiday: number };
  peak_hour_weekday: { hour: number; share: number };
  peak_to_average_ratio: number;
  daily_peak_median: number;
  daily_peak_p95: number;
  saturation_index: number;
  peak_hour_load_per_km: number;
  length_km: number;
  length_indicative: boolean;
  line_share: number;
  peak_hour_record: { value: number; date: string; hour: number };
}

export interface KpiReport {
  by_year: Record<string, { months: number[]; system: Omit<LineKpis, "line_share">; lines: Record<string, LineKpis> }>;
}

export type LonLat = [number, number];

export interface Feature<G, P> {
  type: "Feature";
  geometry: G;
  properties: P;
}

export interface FeatureCollection<G, P> {
  type: "FeatureCollection";
  features: Feature<G, P>[];
}

export type LineGeometry =
  { type: "LineString"; coordinates: LonLat[] } | { type: "MultiLineString"; coordinates: LonLat[][] };

export interface LineProps {
  id: string;
  name: string;
  mode: string;
  km: number;
  has_ridership: boolean;
  indicative: boolean;
  estado: number[];
}

export interface StationProps {
  id: string;
  name: string;
  lines: string[];
  modes: string[];
  tipo: number;
}

export type LinesGeo = FeatureCollection<LineGeometry, LineProps>;
export type StationsGeo = FeatureCollection<{ type: "Point"; coordinates: LonLat }, StationProps>;
export type FeedersGeo = FeatureCollection<LineGeometry, { ruta: string; linea: string }>;
