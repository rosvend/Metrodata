import json
import math

import geopandas as gpd
from shapely.geometry import Point

from scripts.metro.export import write_geojson, write_json


def test_write_json_turns_nan_into_null(tmp_path):
    p = tmp_path / "x.json"
    write_json(p, {"a": math.nan, "b": [1.5, math.nan], 3: "k"})
    assert json.loads(p.read_text()) == {"a": None, "b": [1.5, None], "3": "k"}


def test_write_geojson_rounds_coordinates(tmp_path):
    p = tmp_path / "x.geojson"
    write_geojson(p, gpd.GeoDataFrame({"n": ["á"]}, geometry=[Point(-75.1234567, 6.7654321)], crs="EPSG:4326"))
    f = json.loads(p.read_text(encoding="utf-8"))["features"][0]
    assert f["geometry"]["coordinates"] == [-75.12346, 6.76543]
    assert f["properties"]["n"] == "á"
