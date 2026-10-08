import geopandas as gpd
import pytest
from shapely.geometry import Point, box

from scripts.metro import access

M = "EPSG:9377"


def _iso(rows):
    return gpd.GeoDataFrame(
        [{"station_id": s, "minutes": m} for s, m, _ in rows], geometry=[g for *_, g in rows], crs=M
    )


@pytest.fixture
def iso():
    a = Point(0, 0)
    b = Point(1500, 0)
    return _iso(
        [("a", 5, a.buffer(400)), ("a", 10, a.buffer(800)), ("a", 15, a.buffer(1200)),
         ("b", 5, b.buffer(400)), ("b", 10, b.buffer(800)), ("b", 15, b.buffer(1200))]
    )  # fmt: skip


def test_station_filters_by_mode():
    modes = {"a": ["metro"], "b": ["metrocable"], "c": ["tranvia", "metrocable"]}
    assert access.stations_for("all", modes) == {"a", "b", "c"}
    assert access.stations_for("metro", modes) == {"a"}
    assert access.stations_for("metrocable", modes) == {"b", "c"}


def test_bands_are_disjoint_rings_of_minimum_walking_time(iso):
    bands = access.time_bands(iso)
    assert list(bands["minutes"]) == [5, 10, 15]
    g = dict(zip(bands["minutes"], bands.geometry, strict=True))
    assert g[5].intersection(g[10]).area < 1
    assert g[10].intersection(g[15]).area < 1
    total = g[5].union(g[10]).union(g[15]).area
    assert total == pytest.approx(iso[iso.minutes == 15].union_all().area, rel=1e-6)


def test_overlap_is_area_reachable_from_two_or_more_stations(iso):
    ov = access.overlap(iso)
    c15 = iso[iso.minutes == 15].geometry.tolist()
    assert ov.area == pytest.approx(c15[0].intersection(c15[1]).area, rel=1e-6)


def test_barrio_share_within_15_minutes(iso):
    barrios = gpd.GeoDataFrame(
        {"nombre": ["inside", "half", "outside"], "codigo_comuna": [1, 1, 2]},
        geometry=[box(-100, -100, 100, 100), box(-1300, -100, -1100, 100), box(9000, 9000, 9100, 9100)],
        crs=M,
    )
    out = access.barrio_coverage(barrios, iso).set_index("nombre")
    assert out.loc["inside", "share"] == pytest.approx(1.0)
    assert 0.3 < out.loc["half", "share"] < 0.7
    assert out.loc["outside", "share"] == 0


def test_nearest_stations_by_straight_line():
    pts = gpd.GeoDataFrame({"id": ["a", "b", "c"]}, geometry=[Point(0, 0), Point(300, 0), Point(0, 1000)], crs=M)
    near = access.nearest(pts, k=2)
    assert near["a"] == [{"station_id": "b", "distance_m": 300}, {"station_id": "c", "distance_m": 1000}]


def test_build_counts_only_stations_with_isochrones(iso):
    stations = gpd.GeoDataFrame(
        {"id": ["a", "b", "stop"], "modes": [["metro"], ["metrocable"], ["metroplus"]], "tipo": [1, 1, 2]},
        geometry=[Point(0, 0), Point(1500, 0), Point(3000, 0)],
        crs=M,
    )
    barrios = gpd.GeoDataFrame({"nombre": ["x"], "codigo_comuna": [1]}, geometry=[box(-50, -50, 50, 50)], crs=M)
    _, summary = access.build(iso, stations, barrios)
    assert summary["filters"]["all"]["stations"] == 2
