import json
import math
import urllib.error
import urllib.request
from collections.abc import Callable

import geopandas as gpd
import numpy as np
import shapely
from pyproj import Transformer
from shapely.geometry import Point, shape

WALKING_SPEED_KMH = 4.8
CONTOUR_MINUTES = [5, 10, 15]
SNAP_CUTOFF_M = 400
# Stations are entered from streets/footways, never from trunk or motorway carriageways
SNAP_MAX_ROAD_CLASS = "primary"
GENERALIZE_M = 5
VALHALLA_URL = "http://localhost:8002"
METRIC_CRS = "EPSG:9377"

_TO_M = Transformer.from_crs("EPSG:4326", METRIC_CRS, always_xy=True)

Fetch = Callable[[float, float], dict]


def isochrone_request(lon: float, lat: float) -> dict:
    return {
        "locations": [
            {
                "lon": lon,
                "lat": lat,
                "search_cutoff": SNAP_CUTOFF_M,
                "search_filter": {"max_road_class": SNAP_MAX_ROAD_CLASS},
            }
        ],
        "costing": "pedestrian",
        "costing_options": {"pedestrian": {"walking_speed": WALKING_SPEED_KMH}},
        "contours": [{"time": m} for m in CONTOUR_MINUTES],
        "polygons": True,
        "denoise": 1,
        "generalize": GENERALIZE_M,
        "show_locations": True,
    }


def valhalla_fetch(lon: float, lat: float, url: str = VALHALLA_URL) -> dict:
    """POST one isochrone request; raises RuntimeError with Valhalla's message on failure."""
    body = json.dumps(isochrone_request(lon, lat)).encode()
    req = urllib.request.Request(f"{url}/isochrone", data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as err:
        raise RuntimeError(json.loads(err.read() or b"{}").get("error", str(err))) from err


def parse_contours(response: dict, station_id: str) -> list[dict]:
    rows = [
        {"station_id": station_id, "minutes": int(f["properties"]["contour"]), "geometry": shape(f["geometry"])}
        for f in response.get("features", [])
        if f["geometry"]["type"] in ("Polygon", "MultiPolygon")
    ]
    missing = set(CONTOUR_MINUTES) - {r["minutes"] for r in rows}
    if missing:
        raise ValueError(f"missing contours {sorted(missing)}")
    return sorted(rows, key=lambda r: r["minutes"])


def _metric(geom):
    return shapely.transform(geom, lambda c: np.column_stack(_TO_M.transform(c[:, 0], c[:, 1])))


def area_km2(geom) -> float:
    return _metric(geom).area / 1e6


def circularity(geom, origin: Point) -> float:
    """Area / area of the circle reaching the farthest vertex: 1 for a disk, lower for street-shaped areas."""
    g, o = _metric(geom), _metric(origin)
    r_max = shapely.hausdorff_distance(o, g)
    return g.area / (math.pi * r_max**2)


def snap_distance_m(response: dict, lon: float, lat: float) -> float | None:
    """Distance from the input point to the network point Valhalla snapped it to."""
    for f in response.get("features", []):
        if f["properties"].get("type") == "snapped":
            sx, sy = f["geometry"]["coordinates"][0]
            return round(_metric(Point(lon, lat)).distance(_metric(Point(sx, sy))), 1)
    return None


def compute_all(stations: gpd.GeoDataFrame, fetch: Fetch) -> tuple[gpd.GeoDataFrame, list[dict]]:
    """Isochrones for every station; failures are returned with a reason, never dropped silently."""
    rows, failures = [], []
    for st in stations.itertuples():
        try:
            resp = fetch(st.geometry.x, st.geometry.y)
            snap = snap_distance_m(resp, st.geometry.x, st.geometry.y)
            for r in parse_contours(resp, st.id):
                rows.append({**r, "name": st.name, "area_km2": round(area_km2(r["geometry"]), 4), "snap_m": snap})
        except (RuntimeError, ValueError, OSError) as err:
            failures.append({"station_id": st.id, "name": st.name, "reason": str(err)})
    cols = ["station_id", "name", "minutes", "area_km2", "snap_m", "geometry"]
    return gpd.GeoDataFrame(rows, columns=cols, geometry="geometry", crs="EPSG:4326"), failures


def station_stats(contours: gpd.GeoDataFrame, minutes: int = 15) -> list[dict]:
    """Per station: 15-min area, overlap with other stations' 15-min areas, and overlapping neighbours."""
    c15 = contours[contours["minutes"] == minutes].to_crs(METRIC_CRS).reset_index(drop=True)
    out = []
    for i, row in c15.iterrows():
        others = c15.drop(index=i)
        hits = others[others.intersects(row.geometry)]
        overlaps = [(o.station_id, row.geometry.intersection(o.geometry).area / 1e6) for o in hits.itertuples()]
        union = shapely.union_all(list(hits.geometry)) if len(hits) else None
        overlap = row.geometry.intersection(union).area / 1e6 if union is not None else 0.0
        area = row.geometry.area / 1e6
        out.append(
            {
                "station_id": row.station_id,
                "area_15_km2": round(area, 4),
                "overlap_15_km2": round(overlap, 4),
                "overlap_share": round(overlap / area, 4) if area else 0.0,
                "neighbours": [
                    {"station_id": sid, "overlap_km2": round(a, 4)}
                    for sid, a in sorted(overlaps, key=lambda t: -t[1])
                    if a > 0
                ],
            }
        )
    return out
