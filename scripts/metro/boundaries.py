import json

import geopandas as gpd
import osmium
import osmium.filter
import shapely
import shapely.geometry
import shapely.wkb

from scripts.metro.config import OUT_DIR
from scripts.metro.export import write_geojson
from scripts.metro.osm_extract import BBOX, SOURCE_META, SOURCE_PBF

# Municipalities of the Área Metropolitana del Valle de Aburrá
METRO_AREA = {
    "Medellín", "Bello", "Itagüí", "Envigado", "Sabaneta",
    "La Estrella", "Caldas", "Copacabana", "Girardota", "Barbosa",
}  # fmt: skip
MUNICIPAL_LEVEL = "6"
SIMPLIFY_DEG = 0.0002  # about 20 m
# Area dimmed around the metro area; generous so panning to the bounds never shows an edge
MASK_FRAME = (-76.4, 5.6, -74.8, 6.9)


def select_municipalities(areas: list[dict]) -> gpd.GeoDataFrame:
    """Municipalities touching the valley box, plus metro-area members inside the mask frame (e.g. Barbosa)."""
    valley = shapely.geometry.box(*BBOX)
    frame = shapely.geometry.box(*MASK_FRAME)

    def keep(a: dict) -> bool:
        g = a["geometry"]
        return g.intersects(valley) or (a["name"] in METRO_AREA and g.intersects(frame))

    rows = [a for a in areas if a["admin_level"] == MUNICIPAL_LEVEL and keep(a)]
    gdf = gpd.GeoDataFrame(rows, geometry="geometry", crs="EPSG:4326").drop(columns="admin_level")
    gdf["metro_area"] = gdf["name"].isin(METRO_AREA)
    return gdf.sort_values("name").reset_index(drop=True)


def metro_mask(gdf: gpd.GeoDataFrame):
    """The frame minus the union of the metro-area municipalities."""
    metro = shapely.union_all(list(gdf.loc[gdf["metro_area"], "geometry"]))
    return shapely.geometry.box(*MASK_FRAME).difference(metro)


def with_label_points(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Label anchor inside the part of each municipality that falls in the valley box (where the map looks)."""
    valley = shapely.geometry.box(*BBOX)
    pts = gdf.geometry.map(lambda g: (g.intersection(valley) if g.intersects(valley) else g).representative_point())
    pts = gpd.GeoSeries(pts, crs=gdf.crs)
    return gdf.assign(label_lon=pts.x.round(5), label_lat=pts.y.round(5))


def read_admin_areas(path=SOURCE_PBF) -> list[dict]:
    wkb = osmium.geom.WKBFactory()
    admin = osmium.filter.TagFilter(("boundary", "administrative"))
    out = []
    for obj in osmium.FileProcessor(str(path)).with_locations().with_areas(admin):
        if obj.is_area() and obj.tags.get("admin_level") in (MUNICIPAL_LEVEL,):
            try:
                geom = shapely.wkb.loads(wkb.create_multipolygon(obj), hex=True)
            except RuntimeError:
                continue  # broken multipolygon outside our interest; selection below reports what is kept
            out.append({"name": obj.tags.get("name", ""), "admin_level": obj.tags.get("admin_level"), "geometry": geom})
    return out


def main() -> None:
    gdf = select_municipalities(read_admin_areas())
    gdf["geometry"] = gdf.geometry.simplify(SIMPLIFY_DEG, preserve_topology=True)
    missing = sorted(METRO_AREA - set(gdf["name"]))
    write_geojson(OUT_DIR / "municipalities.geojson", with_label_points(gdf))
    mask = gpd.GeoDataFrame({"name": ["outside metro area"]}, geometry=[metro_mask(gdf)], crs="EPSG:4326")
    write_geojson(OUT_DIR / "metro_mask.geojson", mask)
    meta = json.loads(SOURCE_META.read_text())
    print(
        json.dumps(
            {
                "municipalities": list(gdf["name"]),
                "metro_area_missing": missing,
                "osm_data_timestamp": meta["osm_data_timestamp"],
            },
            ensure_ascii=False,
            indent=1,
        )
    )


if __name__ == "__main__":
    main()
