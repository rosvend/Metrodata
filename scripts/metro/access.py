"""Access map inputs: walking-time bands, overlap, neighbourhood coverage and nearest stations."""

import itertools

import geopandas as gpd
import pandas as pd
import shapely

METRIC = "EPSG:9377"
FILTERS = ["all", "metro", "tranvia", "metrocable"]
MINUTES = [5, 10, 15]
FULLY_INSIDE = 0.99  # share of a neighbourhood's area; absorbs boundary noise from generalised contours
SIMPLIFY_M = 5


def stations_for(kind: str, modes: dict[str, list[str]]) -> set[str]:
    return {sid for sid, m in modes.items() if kind == "all" or kind in m}


def time_bands(iso: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Disjoint rings: area first reachable within 5, then 10, then 15 minutes of any station."""
    rows, inner = [], None
    for m in MINUTES:
        reach = shapely.union_all(list(iso.loc[iso["minutes"] == m, "geometry"]))
        ring = reach if inner is None else reach.difference(inner)
        rows.append({"minutes": m, "geometry": ring})
        inner = reach if inner is None else inner.union(reach)
    return gpd.GeoDataFrame(rows, crs=iso.crs)


def overlap(iso: gpd.GeoDataFrame, minutes: int = 15):
    """Area within `minutes` of two or more stations (union of pairwise intersections)."""
    polys = list(iso.loc[iso["minutes"] == minutes, "geometry"])
    parts = [a.intersection(b) for a, b in itertools.combinations(polys, 2) if a.intersects(b)]
    return shapely.union_all(parts) if parts else shapely.Polygon()


def barrio_coverage(barrios: gpd.GeoDataFrame, iso: gpd.GeoDataFrame, minutes: int = 15) -> pd.DataFrame:
    reach = shapely.union_all(list(iso.loc[iso["minutes"] == minutes, "geometry"]))
    share = barrios.geometry.map(lambda g: g.intersection(reach).area / g.area if g.area else 0.0)
    return pd.DataFrame({"nombre": barrios["nombre"], "codigo_comuna": barrios["codigo_comuna"], "share": share})


def nearest(points: gpd.GeoDataFrame, k: int = 3) -> dict[str, list[dict]]:
    out = {}
    for row in points.itertuples():
        d = points.geometry.distance(row.geometry)
        others = d[points["id"] != row.id].nsmallest(k)
        out[row.id] = [
            {"station_id": points.loc[i, "id"], "distance_m": int(round(dist))} for i, dist in others.items()
        ]
    return out


def build(
    iso: gpd.GeoDataFrame, stations: gpd.GeoDataFrame, barrios: gpd.GeoDataFrame
) -> tuple[gpd.GeoDataFrame, dict]:
    """Coverage features (bands + overlap per filter) in EPSG:4326, and a JSON summary."""
    iso_m, st_m, ba_m = iso.to_crs(METRIC), stations.to_crs(METRIC), barrios.to_crs(METRIC)
    tipo1 = stations[stations["tipo"] == 1]
    modes = dict(zip(tipo1["id"], tipo1["modes"], strict=True))
    city = shapely.union_all(list(ba_m.geometry))
    features, summary = [], {"filters": {}, "fully_inside_threshold": FULLY_INSIDE}
    for kind in FILTERS:
        ids = stations_for(kind, modes)
        sub = iso_m[iso_m["station_id"].isin(ids)]
        bands = time_bands(sub)
        for b in bands.itertuples():
            features.append({"filter": kind, "kind": "band", "minutes": b.minutes, "geometry": b.geometry})
        ov = overlap(sub)
        features.append({"filter": kind, "kind": "overlap", "minutes": 15, "geometry": ov})
        reach15 = shapely.union_all(list(sub.loc[sub["minutes"] == 15, "geometry"]))
        cov = barrio_coverage(ba_m, sub)
        summary["filters"][kind] = {
            "stations": len(ids),
            "area_15_km2": round(reach15.area / 1e6, 2),
            "overlap_15_km2": round(ov.area / 1e6, 2),
            "medellin_urban_share_15": round(reach15.intersection(city).area / city.area, 4),
            "barrios": [
                {"name": r.nombre, "comuna": int(r.codigo_comuna), "share": round(float(r.share), 4)}
                for r in cov.sort_values("share", ascending=False).itertuples()
            ],
        }
    gdf = gpd.GeoDataFrame(features, crs=METRIC)
    gdf["area_km2"] = (gdf.geometry.area / 1e6).round(3)
    gdf["geometry"] = gdf.geometry.simplify(SIMPLIFY_M)
    tipo1 = st_m[st_m["tipo"] == 1].reset_index(drop=True)
    summary["nearest"] = nearest(tipo1)
    return gdf.to_crs(4326), summary
