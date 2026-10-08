# Page 2: Peaks and bottlenecks (Phase 5)

All numbers come from the pipeline. Day-type peak stats (`kpis.json → day_type_peaks[year][day_type]`) reuse the same Python KPI functions as the weekday KPIs.

| Card | Chart | Data | Notes |
|---|---|---|---|
| Line × hour | Heat map (Plot `cell`, YlGn) | `profiles.json` | Toggle: share of the line's day (default) or absolute boardings (√ color scale) |
| System profile by day type | Layered lines | `profiles.json` system rows | The selected day type is drawn thicker |
| Peaks by line | Sortable table with sparklines | `day_type_peaks` + profiles | Peak hour, peak share, peak ÷ average; follows the Days filter |
| Peak-hour load per km | Lollipop | `by_year[year].lines[*].peak_hour_load_per_km` | Weekdays only by definition. Hollow dots mark indicative bus-corridor lengths |
| Saturation (proxy) | Strip plot per year (deterministic jitter) with median and P95 rules | `peaks.json` dots; median, P95 and SI from `kpis.json` | Line selector shows each line's SI. Weekdays only |

Every proxy metric has an info tip with what it does and doesn't mean (`src/lib/kpiText.ts`).

## Map context added in this phase (flow map)
- `municipalities.geojson` and `metro_mask.geojson` come from the Colombia OSM extract (`npm run osm:boundaries`). The 10 Área Metropolitana municipalities are outlined and labeled; everything outside them is shaded.
- `comunas.geojson` (Medellín's 16 comunas) comes from `data/comunas_medellin.geojson` via `npm run data`.
- The basemap is label-free CARTO, and panning is limited to the Valle de Aburrá.
