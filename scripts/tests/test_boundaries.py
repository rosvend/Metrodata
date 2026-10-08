import shapely.geometry
from shapely.geometry import box

from scripts.metro.boundaries import METRO_AREA, select_municipalities


def _area(name, level, geom):
    return {"name": name, "admin_level": level, "geometry": geom}


def test_keeps_municipalities_touching_the_valley_and_flags_metro_area():
    areas = [
        _area("Medellín", "6", box(-75.72, 6.16, -75.50, 6.37)),
        _area("Bello", "6", box(-75.60, 6.30, -75.50, 6.40)),
        _area("Antioquia", "4", box(-77.0, 5.0, -74.0, 8.0)),
        _area("Rionegro", "6", box(-75.45, 6.10, -75.30, 6.20)),
        _area("Bogotá", "6", box(-74.2, 4.5, -74.0, 4.8)),
        _area("Barbosa", "6", box(-75.40, 6.40, -75.25, 6.55)),
        _area("Barbosa", "6", box(-73.65, 5.90, -73.55, 6.00)),
    ]
    out = select_municipalities(areas)
    assert list(out["name"]) == ["Barbosa", "Bello", "Medellín", "Rionegro"]
    assert out.set_index("name")["metro_area"].to_dict() == {
        "Barbosa": True,
        "Bello": True,
        "Medellín": True,
        "Rionegro": False,
    }


def test_metro_area_lists_the_ten_municipalities():
    assert len(METRO_AREA) == 10
    assert {"Medellín", "Envigado", "Barbosa"} <= METRO_AREA


def test_mask_covers_the_frame_outside_the_metro_area():
    from scripts.metro.boundaries import MASK_FRAME, metro_mask

    areas = select_municipalities(
        [
            _area("Medellín", "6", box(-75.72, 6.16, -75.50, 6.37)),
            _area("Rionegro", "6", box(-75.45, 6.10, -75.30, 6.20)),
        ]
    )
    mask = metro_mask(areas)
    assert not mask.contains(box(-75.6, 6.2, -75.55, 6.25).centroid)
    assert mask.contains(box(-75.40, 6.12, -75.35, 6.15).centroid)
    assert mask.area < box(*MASK_FRAME).area


def test_label_points_lie_inside_each_municipality():
    from scripts.metro.boundaries import with_label_points

    gdf = with_label_points(select_municipalities([_area("Medellín", "6", box(-75.72, 6.16, -75.50, 6.37))]))
    row = gdf.iloc[0]
    assert box(-75.72, 6.16, -75.50, 6.37).contains(shapely.geometry.Point(row["label_lon"], row["label_lat"]))


def test_label_points_stay_inside_the_valley_box():
    from scripts.metro.boundaries import BBOX, with_label_points

    bello = _area("Bello", "6", box(-75.60, 6.30, -75.50, 6.60))
    row = with_label_points(select_municipalities([bello])).iloc[0]
    assert BBOX[1] <= row["label_lat"] <= BBOX[3]
