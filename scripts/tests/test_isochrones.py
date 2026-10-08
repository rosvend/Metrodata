import geopandas as gpd
import pytest
from pyproj import Transformer
from shapely.geometry import Point, box, mapping

from scripts.metro import isochrones as iso

TO_M = Transformer.from_crs("EPSG:4326", "EPSG:9377", always_xy=True)
TO_DEG = Transformer.from_crs("EPSG:9377", "EPSG:4326", always_xy=True)


def _disk(lon, lat, radius_m):
    """A metric disk around a lon/lat point, returned in lon/lat."""
    x, y = TO_M.transform(lon, lat)
    poly = Point(x, y).buffer(radius_m, 64)
    return gpd.GeoSeries([poly], crs="EPSG:9377").to_crs(4326).iloc[0]


def _response(lon, lat, minutes=(15, 10, 5)):
    feats = [
        {
            "type": "Feature",
            "properties": {"contour": float(m), "metric": "time"},
            "geometry": mapping(_disk(lon, lat, m * 80)),
        }
        for m in minutes
    ]
    return {"type": "FeatureCollection", "features": feats}


def test_request_uses_pedestrian_costing_speed_and_all_contours():
    req = iso.isochrone_request(-75.56, 6.25)
    assert req["costing"] == "pedestrian"
    assert req["costing_options"]["pedestrian"]["walking_speed"] == iso.WALKING_SPEED_KMH
    assert [c["time"] for c in req["contours"]] == [5, 10, 15]
    assert req["polygons"] is True
    assert req["locations"] == [
        {
            "lon": -75.56,
            "lat": 6.25,
            "search_cutoff": iso.SNAP_CUTOFF_M,
            "search_filter": {"max_road_class": "primary"},
        }
    ]


def test_parse_contours_returns_one_row_per_minute():
    rows = iso.parse_contours(_response(-75.56, 6.25), "x")
    assert [r["minutes"] for r in rows] == [5, 10, 15]
    assert all(r["station_id"] == "x" for r in rows)


def test_parse_contours_rejects_missing_contour():
    with pytest.raises(ValueError, match="missing contours"):
        iso.parse_contours(_response(-75.56, 6.25, minutes=(15, 5)), "x")


def test_area_km2_is_metric():
    disk = _disk(-75.56, 6.25, 1000)
    assert iso.area_km2(disk) == pytest.approx(3.1416, rel=0.01)


def _stations():
    return gpd.GeoDataFrame(
        {"id": ["a", "b", "c"], "name": ["A", "B", "C"]},
        geometry=[Point(-75.560, 6.25), Point(-75.555, 6.25), Point(-75.50, 6.25)],
        crs="EPSG:4326",
    )


def test_compute_all_logs_failures_instead_of_skipping():
    def fetch(lon, lat):
        if lon == -75.50:
            raise RuntimeError("No suitable edges near location")
        return _response(lon, lat)

    contours, failures = iso.compute_all(_stations(), fetch)
    assert sorted(set(contours["station_id"])) == ["a", "b"]
    assert failures == [{"station_id": "c", "name": "C", "reason": "No suitable edges near location"}]


def test_station_stats_area_overlap_and_neighbours():
    contours, _ = iso.compute_all(_stations(), lambda lon, lat: _response(lon, lat))
    stats = {s["station_id"]: s for s in iso.station_stats(contours)}
    a = stats["a"]
    assert a["area_15_km2"] == pytest.approx(3.1416 * 1.2**2, rel=0.01)
    assert 0 < a["overlap_15_km2"] < a["area_15_km2"]
    assert a["overlap_share"] == pytest.approx(a["overlap_15_km2"] / a["area_15_km2"], rel=1e-3)
    assert [n["station_id"] for n in a["neighbours"]] == ["b"]
    assert stats["c"]["neighbours"] == []


def test_circularity_is_one_for_disk_and_lower_for_street_shapes():
    disk = _disk(-75.56, 6.25, 1000)
    assert iso.circularity(disk, Point(-75.56, 6.25)) == pytest.approx(1.0, abs=0.02)
    plus = box(-75.57, 6.249, -75.55, 6.251).union(box(-75.561, 6.24, -75.559, 6.26))
    assert iso.circularity(plus, Point(-75.56, 6.25)) < 0.3


def test_request_asks_for_snapped_locations():
    assert iso.isochrone_request(-75.56, 6.25)["show_locations"] is True


def test_snap_distance_m_reads_snapped_point():
    resp = _response(-75.56, 6.25)
    resp["features"].append(
        {
            "type": "Feature",
            "properties": {"type": "snapped", "location_index": 0},
            "geometry": {"type": "MultiPoint", "coordinates": [[-75.56, 6.2509]]},
        }
    )
    assert iso.snap_distance_m(resp, -75.56, 6.25) == pytest.approx(99.5, abs=1.5)


def test_snap_distance_m_none_when_absent():
    assert iso.snap_distance_m(_response(-75.56, 6.25), -75.56, 6.25) is None
