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
