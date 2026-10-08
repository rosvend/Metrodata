# Data pipeline

Run `npm run data` (or `uv run python -m scripts.metro.build`). It reads `data/` (read-only) and writes `public/data/`.

## Flow
1. `ingest.read_ridership` reads the first sheet of each workbook and locates the header row by its "Día" cell. It checks that the next row holds the 20 hour labels 04:00–23:00, then keeps `dia, linea, h04..h23, total`. Extra trailing columns are ignored, as in the 2026 file.
2. `clean.clean_raw` processes the raw rows:
   - drops "Resultado total" rows and fully empty rows;
   - parses the dates;
   - normalizes line ids (`LÍNEA T-A` → `T-A`);
   - fills empty hour cells with 0, only inside existing rows;
   - asserts that hour sum == total and that there are no duplicate (date, line) rows;
   - flags excluded dates.

   Every step appends an entry to the rule log.
3. `pipeline.load_ridership` concatenates the years and checks coverage and missing dates. It adds `day_type`, `holiday` and `year`.
4. `outputs.*` build the payloads, `quality.report` builds the data quality report, and `export.*` writes compact JSON (NaN → null) and GeoJSON (coordinates rounded to 5 decimals, about 1 m).

## Output schemas
### ridership_hourly.json
Columnar. Row `i` has date `dates[d[i]]`, line `lines[l[i]]` and hourly boardings `v[i*20 : i*20+20]` for `hours` 4..23. Only operating line-days appear as rows, so a missing line-day is a closure. `excluded_dates` lists the days that are left out of KPIs.

### daily_totals.json
Parallel arrays over `dates`: `day_type`, `holiday`, `excluded` and `system`. `lines[id]` is that line's daily total, or `null` when the line was closed.

### kpis.json
- `by_year[Y].system` and `by_year[Y].lines[id]`:
  - `operating_days`, `avg_daily_boardings`, `avg_weekday_boardings`;
  - `weekend_ratio.{saturday,sunday_holiday}`;
  - `peak_hour_weekday.{hour,share}`, `peak_to_average_ratio`;
  - `daily_peak_median`, `daily_peak_p95`, `saturation_index`.
- Lines also carry:
  - `line_share`;
  - `peak_hour_load_per_km`, `length_km`, `length_indicative`;
  - `peak_hour_record.{value,date,hour}`.
- `by_year[Y].months` lists the months covered (2025 is 1–9 and 2026 is 1–7). Per-year figures are therefore not comparable across years; use `jan_jul` and `like_for_like_growth` instead.
- `jan_jul[Y]`: `days`, `avg_daily_boardings` and per-line means.
- `like_for_like_growth[Y]`: `vs`, `system`, `lines`, as fractions (0.022 = +2.2%).
- `monthly["YYYY-MM"]`: `days`, `system` mean daily boardings, and `lines` means over operating days.

### profiles.json
`periods[P][day_type][entity]` is the mean hourly boardings, 20 values. `P` is `2024`, `2025`, `2026`, or `YYYY_jan_jul`. `entity` is `system` or a line id. Means are taken over operating days of that day type.

### peaks.json
`lines[id]` gives weekday `dates`, `peak` (the daily max-hour boardings) and `hour` (when that peak occurred). This feeds the saturation view.

### spikes.json
`dates`, `day_type`, `holiday`, `actual`, `expected`, `n_comparables` and `spike_index` (in %). Both `expected` and `spike_index` are null when `n_comparables < 2`. Excluded dates are not present.

### GeoJSON
- `lines.geojson`: one feature per line `id` with `name`, `mode`, `km`, `has_ridership`, `indicative` and `estado[]`.
- `stations.geojson`: unique stations with `id`, `name`, `lines[]`, `modes[]`, `tipo` (minimum over merged records), `sistemas[]` and `source_records`.
- `feeders.geojson`: 103 feeder-route segments with `ruta`, `linea`, `sentido`, `cuenca` and `itinerario`. This is a context layer only.
- `barrios.geojson`: Medellín neighbourhoods with `nombre` and `codigo_comuna`, reprojected from EPSG:9377.
