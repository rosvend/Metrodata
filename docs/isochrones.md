# Walking isochrones (Phase 2)

Isochrones are precomputed offline. The app never calls Valhalla at runtime.

## Regenerate
```bash
# one-off: download Colombia (Geofabrik), verify md5, clip to the Valle de Aburrá box
mkdir -p .cache/osm && curl -L -o .cache/osm/colombia-latest.osm.pbf https://download.geofabrik.de/south-america/colombia-latest.osm.pbf
npm run osm:extract     # -> .cache/valhalla/custom_files/valle-aburra.osm.pbf + .cache/osm/source.json (about 3 min)
npm run valhalla:start  # ghcr.io/valhalla/valhalla-scripted:3.8.3 on :8002, builds tiles (about 20 s)
npm run isochrones      # computes contours, then reruns `npm run data` so data_quality.json picks up the source
npm run valhalla:stop
uv run python -m scripts.metro.preview_isochrones  # optional: docs/img/isochrones_preview.png
```

## Source (also recorded in data_quality.json → isochrones.source)
- OSM: Geofabrik `colombia-latest.osm.pbf`, data timestamp 2026-10-07T20:20:35Z, md5 436c71da2ac65f9f38a4b586d5dd6e55.
- Clip: bbox lon −75.70..−75.45, lat 6.10..6.40, using pyosmium `ForwardReferenceWriter`. Ways that touch the box are kept complete. The extract is 13 MB.
- Engine: Valhalla 3.8.3, `pedestrian` costing.

## Parameters (`scripts/metro/isochrones.py`)
| Constant | Value | Why |
|---|---|---|
| WALKING_SPEED_KMH | 4.8 | Brief default; change it in one place |
| CONTOUR_MINUTES | 5, 10, 15 | |
| SNAP_CUTOFF_M | 400 | A station farther than this from any walkable edge fails explicitly |
| SNAP_MAX_ROAD_CLASS | primary | Stations are entered from streets or footways, not from trunk or motorway carriageways (see below) |
| GENERALIZE_M | 5 | Douglas–Peucker tolerance. Keeps street detail (about 60 vertices for a 15-min contour) |
| denoise | 1 | Keep only the largest polygon per contour |

### Snapping decision
With default snapping, 8 Line A stations along the river were snapped onto Avenida Regional, a trunk road: Poblado, Tricentenario, Ayurá, Caribe, Envigado, Madera, Industriales and Sabaneta. The walk then ran along the arterial, which gave unrealistically narrow areas (Poblado's 15-min area was 0.51 km² with circularity 0.10). Excluding trunk and motorway from snapping only (walks may still use them) gives Poblado 2.70 km² and snaps that station 43 m away. Per-station snap distances are reported in `isochrone_stats.json`; the maximum is 52 m (Itagüí).

## Outputs
- `isochrones.geojson`: 150 polygons (50 stations × 3 contours) with `station_id`, `name`, `minutes` and `area_km2` (computed in EPSG:9377).
- `isochrone_stats.json`:
  - `source`;
  - `failures` (station, reason). Failures are never skipped silently;
  - per station: `area_15_km2`, `overlap_15_km2` (intersection with the union of all other stations' 15-min areas), `overlap_share`, `neighbours` (stations whose 15-min areas overlap, by overlap km²), `circularity_15` and `snap_m`.

`circularity_15` is the area divided by the area of the circle through the farthest vertex. It is 1 for a crow-flies disk; the observed range is 0.28–0.78, so the contours follow streets. Which stations get isochrones: the 50 unique `tipo` 1 stations (Metro, Tranvía, Metrocable, plus the Metroplús tipo-1 stations). Metroplús stops (tipo 2/3) are excluded, as the brief specifies.
