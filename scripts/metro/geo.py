import re
import unicodedata

import geopandas as gpd
import numpy as np
import shapely
from pyproj import Transformer
from shapely.geometry import Point

from scripts.metro.config import (
    EXTRA_LINE_MODES,
    GEO_LINE_IDS,
    INDICATIVE_LENGTH_LINES,
    LINE_MODES,
    LINE_ORDER,
    STATION_DEDUP_METERS,
    STATION_LINE_IDS,
)

TO_WGS84 = Transformer.from_crs("EPSG:9377", "EPSG:4326", always_xy=True)
TO_MAGNA = Transformer.from_crs("EPSG:4326", "EPSG:9377", always_xy=True)
MODE_ORDER = ["metro", "tranvia", "metrocable", "metroplus"]


def _reproject(coords: np.ndarray) -> np.ndarray:
    return np.column_stack(TO_WGS84.transform(coords[:, 0], coords[:, 1]))


def to_wgs84(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    geoms = shapely.transform(np.asarray(gdf.geometry), _reproject)
    return gpd.GeoDataFrame(gdf.drop(columns="geometry"), geometry=geoms, crs="EPSG:4326")


def mode_of(line: str) -> str:
    return LINE_MODES.get(line) or EXTRA_LINE_MODES[line]


def prepare_lines(raw: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """One feature per line id in EPSG:4326 with mode, km, has_ridership and indicative flags."""
    df = to_wgs84(raw.assign(id=raw["linea"].map(GEO_LINE_IDS)))
    rows = []
    for line_id, g in df.groupby("id", sort=False):
        rows.append(
            {
                "id": line_id,
                "name": " / ".join(g["nombre"]),
                "mode": mode_of(line_id),
                "km": round(float(g["Shape_Length"].sum()) / 1000, 3),
                "has_ridership": line_id in LINE_MODES,
                "indicative": line_id in INDICATIVE_LENGTH_LINES,
                "estado": sorted(int(e) for e in g["estado"].unique()),
                "geometry": shapely.line_merge(shapely.union_all(list(g.geometry))),
            }
        )
    out = gpd.GeoDataFrame(rows, crs="EPSG:4326")
    order = {ln: i for i, ln in enumerate([*LINE_ORDER, "La Aldea"])}
    return out.sort_values("id", key=lambda s: s.map(order)).reset_index(drop=True)


def station_name(label: str) -> str:
    name = re.sub(r"\s*\(.*\)\s*$", "", label)
    return re.sub(r"^(Estación|Parada)\s+", "", name).strip()


def _slug(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")


def _clusters(points: list[tuple[float, float]], max_m: float) -> list[list[int]]:
    clusters: list[list[int]] = []
    for i, (x, y) in enumerate(points):
        for c in clusters:
            cx, cy = points[c[0]]
            if ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 <= max_m:
                c.append(i)
                break
        else:
            clusters.append([i])
    return clusters


def dedupe_stations(raw: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Merge records of the same physical station (same name ignoring case, within STATION_DEDUP_METERS)."""
    rows = []
    named = raw.assign(name=raw["label"].map(station_name))
    for _, g in named.groupby(named["name"].str.casefold(), sort=True):
        g = g.reset_index(drop=True)
        name = g["name"].iloc[0]
        projected = [TO_MAGNA.transform(p.x, p.y) for p in g.geometry]
        for members in _clusters(projected, STATION_DEDUP_METERS):
            sub = g.loc[members]
            lines = sorted({STATION_LINE_IDS.get(ln, ln) for ln in sub["linea"]}, key=LINE_ORDER.index)
            rows.append(
                {
                    "name": name,
                    "lines": lines,
                    "modes": sorted({LINE_MODES[ln] for ln in lines}, key=MODE_ORDER.index),
                    "tipo": int(sub["tipo"].min()),
                    "sistemas": sorted(set(sub["sistema"])),
                    "source_records": len(sub),
                    "geometry": Point(
                        sum(p.x for p in sub.geometry) / len(sub), sum(p.y for p in sub.geometry) / len(sub)
                    ),
                }
            )
    out = gpd.GeoDataFrame(rows, crs="EPSG:4326")
    base = out["name"].map(_slug)
    n = base.groupby(base).cumcount()
    out["id"] = base.where(n == 0, base + "-" + (n + 1).astype(str))
    return out


def prepare_feeders(raw: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    keep = ["ruta", "linea", "sentido", "cuenca", "itinerario"]
    geoms = shapely.force_2d(np.asarray(raw.geometry))
    return gpd.GeoDataFrame(raw[keep], geometry=geoms, crs="EPSG:4326")


def prepare_barrios(raw: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    return to_wgs84(raw[["nombre", "codigo_comuna", "geometry"]])


def prepare_comunas(raw: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Medellín comunas with the 'Comuna N - ' prefix removed from the name."""
    out = raw[["name", "ref", "geometry"]].copy()
    out["name"] = out["name"].str.replace(r"^Comuna\s+\d+\s*-\s*", "", regex=True)
    out["geometry"] = out.geometry.simplify(0.0001, preserve_topology=True)
    return out.reset_index(drop=True)
