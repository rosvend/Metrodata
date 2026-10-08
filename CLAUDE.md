# Medellín Metro BI dashboard

This is a BI course deliverable that will be demoed to a "real customer". It has four pages: flow map, peaks and bottlenecks, calendar and spikes, and an access map with walking isochrones.
Priorities, in order: numeric accuracy, then visual polish and smooth animation, then code simplicity.

## Working agreement
- Work in phases (1 pipeline, 2 isochrones, 3 shell, 4 flow map, 5 peaks, 6 calendar, 7 access, 8 polish). Verify each phase before starting the next, then summarize what was built, what was verified and any open questions.
- If the data contradicts the brief, stop and ask. Never invent data. Ask before changing the stack, dropping a page, or making an assumption that affects reported numbers.
- TDD. Keep the code small and modular (KISS/YAGNI). Code comments are one-liners; long-form docs go in `docs/`.
- `data/` is read-only. `public/data/` is generated and gitignored. Don't commit large derived files unless asked.
- No paid API keys. No `any` in TypeScript.
- **Design (user decision 2026-10-08):** replicate the official metrodemedellin.gov.co UI. This replaces the brief's teal palette and serif headings.
  - Base: white, Outfit font, Metro green #65BC4B, dark panels #111716 with 24 px radius, and the logo at `public/Metro_Medellín_Logo.svg`.
  - Lines use the OFFICIAL line colors (`src/lib/lines.ts`) everywhere, instead of per-mode colors.
  - Green fills take near-black text (white on green fails AA).
  - Keep the UI language in English until the user says otherwise.
  - Check contrast (AA) for any new color pair.
- Never show or compute station-level ridership, OD flows, onboard load or capacity.

## Stack
- **Data:** Python 3.12 via `uv` (pandas, openpyxl, holidays, geopandas, pyproj, shapely, pytest, ruff) in `scripts/metro/`.
- **Isochrones (Phase 2):** Valhalla in Docker, pedestrian costing, precomputed offline.
- **Frontend:** React 19, Vite 8, TypeScript 6 (strict; TS 7 is not yet supported by typescript-eslint), react-router 8 (declarative), Tailwind 4, `motion` (Framer Motion), MapLibre GL 6.11 + react-map-gl 8 + deck.gl 9.4 (`@deck.gl/maplibre` overlay), Observable Plot, Vitest + Testing Library, ESLint + Prettier, and Playwright (system Chrome) for screenshots. Basemap: CARTO Positron / Dark Matter, no key.

## Commands
- `npm run data`: regenerates everything in `public/data/` (runs `uv run python -m scripts.metro.build`, about 3 s).
- `npm run test:py`: pytest, including the real-data reference regression in `scripts/tests/test_reference.py`.
- `npm run lint:py`: ruff lint + format check.
- Frontend: `npm run dev`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run ui:shots` (screenshots plus overflow and console checks, with the dev server running).
- `node scripts/ui/flow-check.mjs`: flow-map screenshots and a playback fps check on the real GPU. Headless Chrome needs `--use-angle=vulkan`, otherwise it renders on SwiftShader and fps is meaningless.
- `npm run osm:boundaries`: municipal boundaries, metro-area mask and label points from the Colombia OSM file. Output: `municipalities.geojson` and `metro_mask.geojson`. Takes about 3 min; needs `.cache/osm`.
- **Isochrones** (needs Docker): `npm run osm:extract` → `npm run valhalla:start` → `npm run isochrones` → `npm run valhalla:stop`. Full steps are in `docs/isochrones.md`. The OSM extract and tiles live in `.cache/` (gitignored).

## Pipeline layout (`scripts/metro/`)
| Module | Role |
|---|---|
| `config.py` | Constants: paths, hour bands, line→mode, core lines, excluded dates, thresholds |
| `ingest.py` | Reads the xlsx (finds the "Día" header row, works with any sheet name and the extra column) |
| `clean.py` | Rules; returns the tidy frame plus a rule log |
| `daytype.py` | Day type and holiday name |
| `kpis.py` | Pure KPI functions over a per-date "days" frame |
| `spikes.py` | spike_index |
| `geo.py` | Lines, stations, feeders, barrios |
| `outputs.py` | Builds the payloads |
| `quality.py` | data_quality.json |
| `export.py` | Writers |
| `pipeline.py` | load + enrich |
| `build.py` | Orchestrator |

## Data rules
- Drop "Resultado total" rows (only the 2026 file has one: 185,914,886, and it equals the cleaned 2026 sum). Drop empty rows.
- Dates: 2024 is text `dd.mm.yyyy`; 2025 and 2026 are Excel datetimes. All become ISO strings.
- Hour columns h04..h23 are hour-of-operation bands (h04 = 04:00–04:59).
- Exclude 2024-02-20 from all KPIs (6,570 boardings, a logging failure). It stays visible in the outputs, flagged `excluded`.
- 2024-01-15 is absent from the source and is not imputed.
- Missing line-days are CLOSURES. Never impute zeros; average over operating days only. Empty hour cells inside an existing line-day are 0.
- Q4 2025 doesn't exist, so YoY is always like-for-like Jan–Jul, and the UI says so wherever YoY appears.
- `day_type` is weekday / saturday / sunday_holiday. A Colombian holiday from the `holidays` package counts as sunday_holiday.
- Metrics are "boardings", never "passengers" or "riders". A transfer counts once per line.
- Modes:
  - Metro: A, B
  - Tranvía: T-A
  - Metrocable: H, J, K, L, M, P
  - Metroplús: 1, 2, O
  - Colors are per line (official), see `src/lib/lines.ts`.
  - "La Aldea" (Cable Palmitas) has geometry but no ridership.
- Line lengths come from Shape_Length in the lines GeoJSON (EPSG:9377, reprojected with pyproj always_xy). Lengths for 1, 2 and O are indicative. The O geometry is the planned Corredor de la 80 (estado 4/5).
- Stations: 167 records → 92 unique, merged by same name (case-insensitive) within 300 m (50 are tipo 1). `lines[]` keeps membership.

## KPI definitions (implemented in `kpis.py`; the UI must reuse the numbers in `public/data/kpis.json`)
- **avg_weekday_boardings:** mean daily boardings on weekday days, operating days only.
- **weekend_ratio:** mean saturday and mean sunday_holiday daily volume divided by mean weekday volume (two values).
- **like_for_like_growth:** mean daily boardings Jan–Jul of Y vs Jan–Jul of Y−1.
- **line_share:** line mean weekday boardings / sum of the line means.
- **peak_hour_concentration:** busiest hour of the mean weekday profile / profile total.
- **peak_to_average_ratio:** busiest hour / mean of operating hours (hours > 0.5% of the line's daily total), on the mean weekday profile.
- **peak_hour_load_per_km:** median over weekdays of the daily max-hour boardings / line km (indicative for 1, 2 and O).
- **saturation_index:** P95 / median of the weekday daily peak-hour volume. This is a PROXY: boardings are not onboard load, and the data has no capacity or headways.
- **spike_index:** (core daily total / expected − 1) × 100.
  - Core lines: A, B, T-A, 1, 2, O, P.
  - Expected: median of the same weekday and the same day_type within ±35 days, excluding the day itself.
  - It is null when there are fewer than 2 comparables (user decision; 24 days).

## Reference values (regression tests, 0.5% tolerance)
- **Totals:** 773,019,001 total boardings. The 2026 sum is 185,914,886.
- **Jan–Jul average daily boardings:** 2024 = 894,007; 2025 = 913,899; 2026 = 876,957.
- **Line A:** 2026 weekday share is 64.9% (683.4k/day). Peak-hour records are 88,553 (2024), 89,551 (2025) and 89,036 (2026).
- **System weekday peak:** 17:00, at 10.4% over all years (10.2% for 2026 alone).
- **spike_index extremes:** +35.1% on 2024-12-22 and −64.8% on 2026-06-21. The election Sundays 2026-03-08, 2026-05-31 and 2026-06-21 are the three lowest days of 2026.

## Phase status
- Phase 1 (pipeline): done.
- Phase 2 (isochrones): done. 50/50 tipo-1 stations, 0 failures.
- Phase 3 (shell + design system): done. See `docs/frontend.md`.
- Phase 4 (flow map): done. See `docs/flow-map.md`.
- Phase 5 (peaks and bottlenecks): done. See `docs/peaks.md`.
- Next: Phase 6 (calendar).
- **Layout rule (user, 2026-10-08):** each page fits one 1440×900 view without scrolling on desktop. `npm run ui:shots` reports any overflow.
- **FPS:** headless measurements are noisy (23–56 fps on the same code). Tuning is deferred to Phase 8.
- Repo: github.com/rosvend/Metrodata (private), branch `main`.
- The user has a Google Maps API key for a LATER comparison of isochrones. It must never be committed or shipped to the frontend; read it from an env var in an offline script only.

## Isochrone rules
- Valhalla 3.8.3, pedestrian costing, 4.8 km/h, contours at 5/10/15 min, generalize 5 m.
- Snapping excludes trunk/motorway (`search_filter.max_road_class=primary`). Without it, 8 river-corridor Line A stations snapped onto Avenida Regional.
- Point-in-polygon answers in the UI are at contour resolution (5-minute steps).

## Outputs (`public/data/`)
`ridership_hourly.json` (columnar), `daily_totals.json`, `kpis.json`, `profiles.json`, `peaks.json`, `spikes.json`, `lines.geojson`, `stations.geojson`, `feeders.geojson`, `barrios.geojson`, `data_quality.json`, `isochrones.geojson`, `isochrone_stats.json`. The schemas are in `docs/pipeline.md`.
