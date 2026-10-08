import geopandas as gpd
import pytest
from shapely.geometry import LineString, Point

from scripts.metro.geo import dedupe_stations, prepare_lines, station_name


def test_station_name_strips_prefix_and_line_suffix():
    assert station_name("Estación San Antonio (Línea B)") == "San Antonio"
    assert station_name("Parada Los Alpes (Línea 1)") == "Los Alpes"


def _stations(rows):
    return gpd.GeoDataFrame(
        [{"label": lab, "linea": ln, "sistema": sis, "tipo": t} for lab, ln, sis, t, _ in rows],
        geometry=[Point(xy) for *_, xy in rows],
        crs="EPSG:4326",
    )


def test_dedupe_merges_same_name_nearby_and_keeps_line_list():
    s = _stations(
        [
            ("Estación San Antonio (Línea A)", "A", "Metro", 1, (-75.5690, 6.2470)),
            ("Estación San Antonio (Línea B)", "B", "Metro", 1, (-75.5691, 6.2471)),
            ("Estación San Antonio (Línea T)", "T", "T", 1, (-75.5680, 6.2470)),
        ]
    )
    out = dedupe_stations(s)
    assert len(out) == 1
    row = out.iloc[0]
    assert row["lines"] == ["A", "B", "T-A"]
    assert row["modes"] == ["metro", "tranvia"]
    assert row["name"] == "San Antonio"


def test_dedupe_keeps_same_name_far_apart_separate():
    s = _stations(
        [
            ("Estación Oriente (Línea H)", "H", "Cable", 1, (-75.540, 6.230)),
            ("Estación Oriente (Línea T)", "T", "T", 1, (-75.550, 6.230)),
        ]
    )
    assert len(dedupe_stations(s)) == 2
    assert dedupe_stations(s)["id"].is_unique


def test_prepare_lines_reprojects_and_dissolves():
    raw = gpd.GeoDataFrame(
        [
            {"linea": "Línea O", "nombre": "seg1", "estado": 4, "Shape_Length": 1000.0},
            {"linea": "Línea O", "nombre": "seg2", "estado": 5, "Shape_Length": 500.0},
            {"linea": "La Aldea", "nombre": "Cable Palmitas", "estado": 1, "Shape_Length": 2000.0},
        ],
        geometry=[
            LineString([(4714973, 2247144), (4715973, 2247144)]),
            LineString([(4715973, 2247144), (4716473, 2247144)]),
            LineString([(4701122, 2259607), (4700400, 2258935)]),
        ],
        crs="EPSG:9377",
    )
    out = prepare_lines(raw).set_index("id")
    assert out.crs.to_epsg() == 4326
    assert out.loc["O", "km"] == pytest.approx(1.5)
    assert out.loc["O", "mode"] == "metroplus"
    assert bool(out.loc["O", "indicative"]) is True
    assert bool(out.loc["La Aldea", "has_ridership"]) is False
    minx, miny, maxx, maxy = out.total_bounds
    assert -76 < minx < maxx < -75 and 6 < miny < maxy < 7


def test_dedupe_ignores_name_case():
    s = _stations(
        [
            ("Parada Barrio los Colores AV 80 x CL 54 (Línea O)", "O", "MPLUS", 3, (-75.5900, 6.2600)),
            ("Parada Barrio los colores AV 80 x CL 54 (Línea O)", "O", "MPLUS", 3, (-75.5901, 6.2601)),
        ]
    )
    assert len(dedupe_stations(s)) == 1


def test_prepare_comunas_keeps_name_and_ref():
    from scripts.metro.geo import prepare_comunas

    raw = gpd.GeoDataFrame(
        [{"name": "Comuna 9 - Buenos Aires", "ref": "9", "boundary": "administrative", "wikidata": None}],
        geometry=[Point(-75.55, 6.24).buffer(0.01)],
        crs="EPSG:4326",
    )
    out = prepare_comunas(raw)
    assert list(out.columns) == ["name", "ref", "geometry"]
    assert out.iloc[0]["name"] == "Buenos Aires"


def test_simplify_for_web_drops_vertices_and_keeps_area():
    from scripts.metro.geo import simplify_for_web

    circle = gpd.GeoDataFrame({"n": [1]}, geometry=[Point(-75.56, 6.25).buffer(0.01, 256)], crs="EPSG:4326")
    out = simplify_for_web(circle, meters=5)
    assert len(out.geometry.iloc[0].exterior.coords) < len(circle.geometry.iloc[0].exterior.coords)
    assert out.geometry.iloc[0].area == pytest.approx(circle.geometry.iloc[0].area, rel=0.01)
