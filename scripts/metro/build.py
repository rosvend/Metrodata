import json
import logging

import geopandas as gpd

from scripts.metro import outputs, quality
from scripts.metro.config import BARRIOS_FILE, FEEDERS_FILE, LINES_FILE, OUT_DIR, STATION_DEDUP_METERS, STATIONS_FILE
from scripts.metro.export import write_geojson, write_json
from scripts.metro.geo import dedupe_stations, prepare_barrios, prepare_feeders, prepare_lines
from scripts.metro.pipeline import load_ridership

log = logging.getLogger("metro.build")


def _isochrones() -> dict | None:
    path = OUT_DIR / "isochrone_stats.json"
    if not path.exists():
        return None
    stats = json.loads(path.read_text())
    return {"source": stats["source"], "failures": stats["failures"], "details": path.name}


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    df, file_report = load_ridership()
    for year, r in file_report.items():
        for rule in r["rules"]:
            log.info("%s %s: %s", year, rule["rule"], {k: v for k, v in rule.items() if k != "rule"})

    lines = prepare_lines(gpd.read_file(LINES_FILE))
    raw_stations = gpd.read_file(STATIONS_FILE)
    stations = dedupe_stations(raw_stations)
    lengths = {r.id: {"km": r.km, "indicative": r.indicative} for r in lines.itertuples()}

    spikes = outputs.spikes(df)
    stations_summary = {
        "source_records": len(raw_stations),
        "unique_stations": len(stations),
        "merged_within_m": STATION_DEDUP_METERS,
        "tipo1_unique": int((stations["tipo"] == 1).sum()),
    }

    write_json(OUT_DIR / "ridership_hourly.json", outputs.ridership_hourly(df))
    write_json(OUT_DIR / "daily_totals.json", outputs.daily_totals(df))
    write_json(OUT_DIR / "kpis.json", outputs.kpi_report(df, lengths))
    write_json(OUT_DIR / "profiles.json", outputs.profiles(df))
    write_json(OUT_DIR / "peaks.json", outputs.peak_distributions(df))
    write_json(OUT_DIR / "spikes.json", spikes)
    write_geojson(OUT_DIR / "lines.geojson", lines)
    write_geojson(OUT_DIR / "stations.geojson", stations)
    write_geojson(OUT_DIR / "feeders.geojson", prepare_feeders(gpd.read_file(FEEDERS_FILE)))
    write_geojson(OUT_DIR / "barrios.geojson", prepare_barrios(gpd.read_file(BARRIOS_FILE)))
    write_json(OUT_DIR / "data_quality.json", quality.report(df, file_report, stations_summary, spikes, _isochrones()))
    log.info("wrote outputs to %s", OUT_DIR)


if __name__ == "__main__":
    main()
