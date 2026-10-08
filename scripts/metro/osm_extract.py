import hashlib
import json
from pathlib import Path

import osmium

from scripts.metro.config import ROOT

SOURCE_URL = "https://download.geofabrik.de/south-america/colombia-latest.osm.pbf"
SOURCE_PBF = ROOT / ".cache" / "osm" / "colombia-latest.osm.pbf"
CUSTOM_FILES = ROOT / ".cache" / "valhalla" / "custom_files"
EXTRACT_PBF = CUSTOM_FILES / "valle-aburra.osm.pbf"
SOURCE_META = ROOT / ".cache" / "osm" / "source.json"
BBOX = (-75.70, 6.10, -75.45, 6.40)  # lon_min, lat_min, lon_max, lat_max


def in_bbox(lon: float, lat: float, bbox: tuple = BBOX) -> bool:
    return bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]


def _md5(path: Path) -> str:
    h = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def extract(src: Path = SOURCE_PBF, out: Path = EXTRACT_PBF) -> dict:
    """Clip src to BBOX keeping complete ways (ways touching the box keep all their nodes)."""
    out.parent.mkdir(parents=True, exist_ok=True)
    with osmium.ForwardReferenceWriter(str(out), str(src), overwrite=True) as writer:
        for node in osmium.FileProcessor(str(src), osmium.osm.NODE):
            if in_bbox(node.location.lon, node.location.lat):
                writer.add_node(node)
    header = osmium.io.Reader(str(src)).header()
    meta = {
        "source_url": SOURCE_URL,
        "source_md5": _md5(src),
        "osm_data_timestamp": header.get("osmosis_replication_timestamp"),
        "bbox": {"lon_min": BBOX[0], "lat_min": BBOX[1], "lon_max": BBOX[2], "lat_max": BBOX[3]},
        "strategy": "pyosmium ForwardReferenceWriter (complete ways and their nodes)",
        "extract_file": out.name,
        "extract_bytes": out.stat().st_size,
    }
    SOURCE_META.write_text(json.dumps(meta, indent=2))
    return meta


if __name__ == "__main__":
    print(json.dumps(extract(), indent=2))
