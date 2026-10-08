import json
import logging
import urllib.request

import geopandas as gpd

from scripts.metro import isochrones as iso
from scripts.metro.config import OUT_DIR
from scripts.metro.export import write_geojson, write_json
from scripts.metro.osm_extract import SOURCE_META

log = logging.getLogger("metro.isochrones")
STATS_FILE = OUT_DIR / "isochrone_stats.json"
SNAP_WARN_M = 100


def _valhalla_version() -> str:
    try:
        with urllib.request.urlopen(f"{iso.VALHALLA_URL}/status", timeout=5) as resp:
            return json.load(resp)["version"]
    except OSError as err:
        raise SystemExit(
            f"Valhalla is not reachable at {iso.VALHALLA_URL}; run ./scripts/valhalla.sh start ({err})"
        ) from err


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    version = _valhalla_version()
    stations = gpd.read_file(OUT_DIR / "stations.geojson")
    targets = stations[stations["tipo"] == 1].reset_index(drop=True)
    log.info("computing isochrones for %d tipo-1 stations", len(targets))

    contours, failures = iso.compute_all(targets, iso.valhalla_fetch)
    for f in failures:
        log.warning("FAILED %s (%s): %s", f["station_id"], f["name"], f["reason"])

    stats = iso.station_stats(contours)
    origin = targets.set_index("id").geometry
    c15 = contours[contours["minutes"] == 15].set_index("station_id").geometry
    snaps = contours.groupby("station_id")["snap_m"].first()
    for s in stats:
        s["circularity_15"] = round(iso.circularity(c15[s["station_id"]], origin[s["station_id"]]), 3)
        s["snap_m"] = snaps[s["station_id"]]
        if s["snap_m"] is None or s["snap_m"] > SNAP_WARN_M:
            log.warning("station %s snapped %s m from its point", s["station_id"], s["snap_m"])

    write_geojson(OUT_DIR / "isochrones.geojson", contours.drop(columns="snap_m"), precision=5)
    write_json(
        STATS_FILE,
        {
            "source": {
                "osm": json.loads(SOURCE_META.read_text()),
                "valhalla_version": version,
                "costing": "pedestrian",
                "walking_speed_kmh": iso.WALKING_SPEED_KMH,
                "contours_minutes": iso.CONTOUR_MINUTES,
                "snap_search_cutoff_m": iso.SNAP_CUTOFF_M,
                "snap_max_road_class": iso.SNAP_MAX_ROAD_CLASS,
                "generalize_m": iso.GENERALIZE_M,
                "stations_requested": len(targets),
                "stations_ok": len(targets) - len(failures),
            },
            "failures": failures,
            "stations": stats,
        },
    )
    log.info("ok %d / %d stations, %d failures", len(targets) - len(failures), len(targets), len(failures))


if __name__ == "__main__":
    main()
