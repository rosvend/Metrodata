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
  day_type_peaks: Record<string, Partial<Record<DayTypeKey, DayTypePeaks>>>;
  monthly: Record<string, MonthlyEntry>;
  like_for_like_growth: Record<string, { vs: number; system: number; lines: Record<string, number> }>;
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

export type AreaGeometry =
  { type: "Polygon"; coordinates: LonLat[][] } | { type: "MultiPolygon"; coordinates: LonLat[][][] };

export interface MunicipalityProps {
  name: string;
  metro_area: boolean;
  label_lon: number;
  label_lat: number;
}

export type MunicipalitiesGeo = FeatureCollection<AreaGeometry, MunicipalityProps>;
export type MaskGeo = FeatureCollection<AreaGeometry, { name: string }>;
export type ComunasGeo = FeatureCollection<AreaGeometry, { name: string; ref: string }>;

export interface PeakStats {
  operating_days: number;
  peak_hour: { hour: number; share: number };
  peak_to_average_ratio: number;
}

export interface DayTypePeaks {
  system: PeakStats;
  lines: Record<string, PeakStats>;
}

export interface PeaksJson {
  day_type: "weekday";
  lines: Record<string, { dates: string[]; peak: number[]; hour: number[] }>;
}

export interface SpikesJson {
  lines_used: string[];
  window_days: number;
  min_comparables: number;
  dates: string[];
  day_type: DayTypeKey[];
  holiday: (string | null)[];
  holiday_es: (string | null)[];
  actual: number[];
  expected: (number | null)[];
  n_comparables: number[];
  spike_index: (number | null)[];
  driver: string[];
  driver_label: string[];
}

export interface SpikeProfiles {
  hours: number[];
  lines_used: string[];
  dates: string[];
  actual: number[][];
  expected: (number[] | null)[];
}

export interface DailyTotals {
  dates: string[];
  day_type: DayTypeKey[];
  holiday: (string | null)[];
  holiday_es: (string | null)[];
  excluded: boolean[];
  system: number[];
  lines: Record<string, (number | null)[]>;
}

export interface MonthlyEntry {
  days: number;
  system: number;
  lines: Record<string, number>;
}

export interface IsochroneProps {
  station_id: string;
  name: string;
  minutes: number;
  area_km2: number;
}

export type IsochronesGeo = FeatureCollection<AreaGeometry, IsochroneProps>;

export type AccessFilter = "all" | "metro" | "tranvia" | "metrocable";

export type CoverageGeo = FeatureCollection<
  AreaGeometry,
  { filter: AccessFilter; kind: "band" | "overlap"; minutes: number; area_km2: number }
>;

export interface AccessSummary {
  fully_inside_threshold: number;
  filters: Record<
    AccessFilter,
    {
      stations: number;
      area_15_km2: number;
      overlap_15_km2: number;
      medellin_urban_share_15: number;
      barrios: { name: string; comuna: number; share: number }[];
    }
  >;
  nearest: Record<string, { station_id: string; distance_m: number }[]>;
}

export interface IsochroneStats {
  source: {
    osm: { osm_data_timestamp: string };
    valhalla_version: string;
    walking_speed_kmh: number;
    generalize_m: number;
  };
  failures: { station_id: string; name: string; reason: string }[];
  stations: {
    station_id: string;
    area_15_km2: number;
    overlap_15_km2: number;
    overlap_share: number;
    neighbours: { station_id: string; overlap_km2: number }[];
    circularity_15: number;
    snap_m: number;
  }[];
}
