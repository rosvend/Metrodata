import json
import math
from pathlib import Path

import geopandas as gpd
import numpy as np
import shapely


def _clean(value):
    if isinstance(value, float):
        return None if math.isnan(value) else value
    if isinstance(value, dict):
        return {str(k): _clean(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_clean(v) for v in value]
    return value


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_clean(payload), ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def write_geojson(path: Path, gdf: gpd.GeoDataFrame, precision: int = 5) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rounded = gdf.set_geometry(shapely.transform(np.asarray(gdf.geometry), lambda c: np.round(c, precision)))
    path.write_text(rounded.to_json(drop_id=True, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
