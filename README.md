# Metrodata: Medellín Metro ridership intelligence

An interactive BI dashboard built on hourly boardings for the 12 lines of the Metro de Medellín system (January 2024 to July 2026), with walking-access analysis around every main station.

| Page | What it answers |
|---|---|
| **Flow** | Which lines carry the most boardings, hour by hour (animated map) |
| **Peaks** | When and where the network strains: peak hours, sharpness, load per km, saturation (proxy) |
| **Calendar** | Which days broke the pattern, with like-for-like (Jan–Jul) trends |
| **Access** | 5/10/15-minute walking areas around each station, and city coverage |

A guided **Demo** (button in the top bar) walks through the four pages, with narration computed from the data.

## Requirements
- Node.js 20.19+ or 22.12+ (developed on 24)
- [uv](https://docs.astral.sh/uv/) for Python 3.12 (the data pipeline)
- Docker, only to recompute the walking areas
- Internet access for the basemap tiles (CARTO, no API key)

## Quick start
```bash
npm install
uv sync
npm run data        # builds public/data/ from data/ (about 10 s)
npm run dev         # http://localhost:5173
```
`public/data/` is generated and not committed. The walking-area files (`isochrones.geojson`, `isochrone_stats.json`, `access*`, `municipalities.geojson`, `metro_mask.geojson`) also need the OSM steps below. Without them, the flow map shows no city outlines and the Access page cannot load.

## Regenerating the data
```bash
npm run data                       # ridership pipeline, KPIs, spikes, geodata, access summaries
# walking areas and municipal boundaries (one-off, needs Docker and ~350 MB download)
mkdir -p .cache/osm && curl -L -o .cache/osm/colombia-latest.osm.pbf \
  https://download.geofabrik.de/south-america/colombia-latest.osm.pbf
npm run osm:extract                # clip to the Valle de Aburrá
npm run osm:boundaries             # municipalities, metro-area mask
npm run valhalla:start             # local Valhalla routing engine
npm run isochrones                 # 5/10/15-minute walking areas, then reruns npm run data
npm run valhalla:stop
```

## Tests and checks
```bash
npm run test:py      # pytest: cleaning rules, KPIs and reference values (0.5% tolerance)
npm test             # vitest: UI logic
npm run lint         # eslint + prettier
npm run lint:py      # ruff
npm run typecheck
```
These browser checks use Playwright with the system Chrome, against a running server (dev on :5173 or preview on :4173):
| Script | Checks |
|---|---|
| `npm run ui:shots` | screenshots of every page (light/dark, desktop/phone), console errors, horizontal overflow, single-view fit |
| `node scripts/ui/flow-check.mjs` | flow map views, tooltip, playback frame rate |
| `node scripts/ui/calendar-check.mjs` | deep links, ranked list, hover tips |
| `node scripts/ui/access-check.mjs` | station view, click-anywhere, coverage, neighbourhoods |
| `node scripts/ui/demo-check.mjs` | the whole guided demo |
| `node scripts/ui/a11y-check.mjs` | axe-core WCAG 2.1 AA scan |
| `node scripts/ui/keyboard-check.mjs` | tab order and focus rings |
| `npm run perf` | cold-load time per page |

`uv run python -m scripts.metro.colorcheck` checks the palettes for colour-vision deficiencies.

## Production build
```bash
npm run build        # typecheck, vite build, then .gz/.br precompression of every text asset
npx vite preview     # serve dist/ on :4173
```
`dist/` is a static site.
- **Routing:** configure the host to serve `index.html` for unknown paths, because client-side routes like `/calendar` need it.
- **Compression:** enable precompressed files if the host supports them (for example nginx `gzip_static`/`brotli_static`).

## Data and honesty rules
- **Units:** figures are **boardings**, not passengers. Someone changing lines is counted once per line.
- **Granularity:** there is no station-level or origin–destination data. Maps show line-level volumes only.
- **Year-over-year:** comparisons use **January–July only**, because October–December 2025 does not exist in the source.
- **Bottleneck measures:** peak concentration, load per km and the saturation index are **proxies**. The data has no capacity, headways or onboard counts.
- **Spike drivers:** explanations for spikes and dips are labelled **hypotheses**.
- **Excluded and missing days:** 2024-02-20 (probable logging failure) is excluded from all measures; 2024-01-15 is missing in the source.

## Documentation
| File | Topic |
|---|---|
| `docs/pipeline.md` | data pipeline and output schemas |
| `docs/kpis.md` | KPI definitions |
| `docs/data-quality.md` | cleaning rules and limitations |
| `docs/isochrones.md` | walking-area method and source |
| `docs/frontend.md` | app structure and design system |
| `docs/flow-map.md`, `docs/peaks.md`, `docs/calendar.md`, `docs/access.md` | one per page |
| `docs/polish.md` | performance, accessibility and demo mode |

## Sources
- Ridership, stations, lines and feeder routes: Metro de Medellín open data (`data/`)
- Neighbourhoods and comunas: Medellín open data (`data/`)
- Streets and municipal boundaries: © OpenStreetMap contributors (Geofabrik extract)
- Basemap: © CARTO
- Logo: Metro de Medellín
