import geopandas as gpd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import osmium  # noqa: E402
from shapely.geometry import LineString  # noqa: E402

from scripts.metro.config import OUT_DIR, ROOT  # noqa: E402
from scripts.metro.osm_extract import EXTRACT_PBF  # noqa: E402

SAMPLES = ["san-antonio", "poblado", "santo-domingo", "estadio"]
COLORS = {5: "#15756B", 10: "#2FA38F", 15: "#F2A900"}
OUT = ROOT / "docs" / "img" / "isochrones_preview.png"
PAD = 0.016  # degrees around each sample station


def streets(bounds) -> gpd.GeoSeries:
    """Walkable OSM ways inside bounds, read from the clipped extract."""
    minx, miny, maxx, maxy = bounds
    lines = []
    for w in osmium.FileProcessor(str(EXTRACT_PBF), osmium.osm.NODE | osmium.osm.WAY).with_locations():
        if not w.is_way() or "highway" not in w.tags:
            continue
        pts = [(n.lon, n.lat) for n in w.nodes if n.location.valid()]
        if len(pts) > 1 and any(minx <= x <= maxx and miny <= y <= maxy for x, y in pts):
            lines.append(LineString(pts))
    return gpd.GeoSeries(lines, crs="EPSG:4326")


def main() -> None:
    iso = gpd.read_file(OUT_DIR / "isochrones.geojson")
    stations = gpd.read_file(OUT_DIR / "stations.geojson").set_index("id")
    fig, axes = plt.subplots(1, len(SAMPLES), figsize=(6 * len(SAMPLES), 6))
    for ax, sid in zip(axes, SAMPLES, strict=True):
        p = stations.loc[sid].geometry
        bounds = (p.x - PAD, p.y - PAD, p.x + PAD, p.y + PAD)
        streets(bounds).plot(ax=ax, color="#9aa5a8", linewidth=0.4)
        for m in (15, 10, 5):
            iso[(iso.station_id == sid) & (iso.minutes == m)].plot(
                ax=ax, color=COLORS[m], alpha=0.35, edgecolor=COLORS[m], linewidth=1.2
            )
        ax.plot(p.x, p.y, "o", color="#0E3B43", markersize=7)
        ax.set_xlim(bounds[0], bounds[2])
        ax.set_ylim(bounds[1], bounds[3])
        ax.set_title(f"{stations.loc[sid, 'name']} - 5/10/15 min walk")
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_xlabel("")
        ax.set_ylabel("")
    fig.tight_layout()
    fig.savefig(OUT, dpi=110, bbox_inches="tight")
    print(OUT)


if __name__ == "__main__":
    main()
