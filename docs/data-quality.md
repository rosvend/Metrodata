# Data quality and known limitations

The machine-readable version is `public/data/data_quality.json`. It is regenerated on every build.

## Source files
| File | Notes |
|---|---|
| Afluencia_Metro_2024.xlsx | Sheet "Afluencia_2022". Dates are text `dd.mm.yyyy`. Covers 2024-01-01..12-31. **2024-01-15 is absent.** No summary row. |
| Afluencia_Metro_2025.xlsx | Sheet "Hoja1". Excel datetimes. Covers 2025-01-01..09-30. **Q4 2025 does not exist.** No summary row. |
| Afluencia_Metro_2026.xlsx | Sheet "Afluencia_Metro_2026". Excel datetimes, one extra empty column. Covers 2026-01-01..07-31. One "Resultado total" row (185,914,886), which reconciles exactly. |
| Estaciones_Sistema_Metro.geojson | 167 points, CRS84 with Z. Metroplús stops repeat per line and per direction. |
| lineas_del_sistema_de_tra.geojson | 14 features in EPSG:9377. Línea O has 2 segments, estado 4 and 5. |
| Rutas_Alimentadoras.geojson | 103 segments, 47 routes, CRS84 with Z. Context only. |
| medellin_barrios.geojson | 269 neighbourhoods in EPSG:9377. Medellín only. Not mentioned in the original brief. |
| comunas_medellin.geojson | 16 comunas in EPSG:4326. Not used yet. |

## Cleaning rules
1. Drop "Resultado total" and empty rows, and log the counts.
2. Parse both date formats into ISO dates.
3. Empty hour cells inside an existing line-day are 0. Missing line-days are closures and are never imputed.
4. Every row's hour sum must equal its total, and every (date, line) must be unique. Both checks fail the build if violated.
5. 2024-02-20 (6,570 system boardings against roughly 700K expected) is excluded from all KPIs and stays visible, flagged.

## Closures (missing line-days)
These are mostly Metrocable lines. Línea L (Arví) has a weekly closure day that moved over time: Mondays in 2024 (37 of 46 closures, the rest Tuesdays), mixed in 2025 (23 Tuesdays, 13 Mondays), and Tuesdays only in 2026 (26 of 26). The other cable lines have maintenance blocks. The per-line, per-year counts and dates are in `closures`. Lines A, B, T-A, 1, 2, O and P have no missing days, which is why they form the spike_index core.

## Station deduplication
Records with the same name (case-insensitive, after removing the "Estación"/"Parada" prefix and the "(Línea X)" suffix) that lie within 300 m are merged into one station, and their lines are collected into `lines[]`. Examples include San Antonio [A, B, T-A], Acevedo [A, K, P], Cisneros [B, 1], Facultad de Minas (whose two directions are 256 m apart) and "Barrio los Colores" (the same stop spelled with different capitalization). 167 records become 92 unique stations, 50 of them tipo 1.

## Known limitations (to be stated in the UI)
- Ridership is per line, per day, per hour. There is no station-level or origin–destination data.
- Bottleneck metrics (peak concentration, load per km, saturation index) are proxies, not measured crowding. There is no capacity or headway data.
- Explanations for spikes and dips (Christmas lights, Feria de las Flores, long weekends, elections) are hypotheses.
- The Línea O geometry and length (30.06 km, planned Corredor de la 80) are indicative. Lengths for Lines 1 and 2 are indicative BRT corridors.
- Station `tipo` semantics are inferred (1 = station, 2–3 = BRT stops), not documented.
