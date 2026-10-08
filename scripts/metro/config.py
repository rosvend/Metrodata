from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
OUT_DIR = ROOT / "public" / "data"

RIDERSHIP_FILES = {
    2024: DATA_DIR / "Afluencia_Metro_2024.xlsx",
    2025: DATA_DIR / "Afluencia_Metro_2025.xlsx",
    2026: DATA_DIR / "Afluencia_Metro_2026.xlsx",
}
STATIONS_FILE = DATA_DIR / "Estaciones_Sistema_Metro.geojson"
LINES_FILE = DATA_DIR / "lineas_del_sistema_de_tra.geojson"
FEEDERS_FILE = DATA_DIR / "Rutas_Alimentadoras.geojson"
BARRIOS_FILE = DATA_DIR / "medellin_barrios.geojson"
COMUNAS_FILE = DATA_DIR / "comunas_medellin.geojson"

# Hour-of-operation bands: 4 means 04:00-04:59
HOURS = list(range(4, 24))
HOUR_COLS = [f"h{h:02d}" for h in HOURS]

# Expected coverage per file (inclusive)
COVERAGE = {
    2024: ("2024-01-01", "2024-12-31"),
    2025: ("2025-01-01", "2025-09-30"),
    2026: ("2026-01-01", "2026-07-31"),
}

# Probable logging failure: kept in outputs, excluded from all KPIs
EXCLUDED_DATES = {"2024-02-20": "probable logging failure; about 700,000 were expected"}

LINE_MODES = {
    "A": "metro",
    "B": "metro",
    "T-A": "tranvia",
    "H": "metrocable",
    "J": "metrocable",
    "K": "metrocable",
    "L": "metrocable",
    "M": "metrocable",
    "P": "metrocable",
    "1": "metroplus",
    "2": "metroplus",
    "O": "metroplus",
}
LINE_ORDER = ["A", "B", "T-A", "H", "J", "K", "L", "M", "P", "1", "2", "O"]

# Lines with continuous operation, used for spike_index
CORE_LINES = ["A", "B", "T-A", "1", "2", "O", "P"]

# Lines whose length is indicative only (BRT corridors, Línea O under construction)
INDICATIVE_LENGTH_LINES = {"1", "2", "O"}

# lines GeoJSON "linea" property -> ridership line id
GEO_LINE_IDS = {
    "Línea A": "A",
    "Línea B": "B",
    "Línea T": "T-A",
    "Línea H": "H",
    "Línea J": "J",
    "Línea K": "K",
    "Línea L": "L",
    "Línea M": "M",
    "Línea P": "P",
    "Línea 1": "1",
    "Línea 2": "2",
    "Línea O": "O",
    "La Aldea": "La Aldea",
}
EXTRA_LINE_MODES = {"La Aldea": "metrocable"}

# Stations GeoJSON "linea" property -> ridership line id
STATION_LINE_IDS = {"T": "T-A"}

SPIKE_WINDOW_DAYS = 35
SPIKE_MIN_COMPARABLES = 2
OPERATING_HOUR_MIN_SHARE = 0.005
JAN_JUL_MONTHS = range(1, 8)
STATION_DEDUP_METERS = 300
