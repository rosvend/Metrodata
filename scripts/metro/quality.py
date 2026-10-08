import datetime as dt

import pandas as pd

from scripts.metro.config import COVERAGE, EXCLUDED_DATES, HOUR_COLS, LINE_ORDER


def closures(df: pd.DataFrame) -> dict:
    """Per line and year: calendar days covered vs operating days (missing line-days are closures)."""
    out = {}
    for y in COVERAGE:
        file_days = set(df.loc[df["year"] == y, "date"])
        out[y] = {}
        for ln in LINE_ORDER:
            op = set(df.loc[(df["year"] == y) & (df["line"] == ln), "date"])
            closed = sorted(file_days - op)
            out[y][ln] = {
                "days_in_file": len(file_days),
                "operating_days": len(op),
                "closed_days": len(closed),
                "closed_dates": closed,
            }
    return out


def reconciliation(df: pd.DataFrame, file_report: dict) -> dict:
    stated = file_report[2026]["rules"][0]["summary_totals"]
    cleaned = int(df.loc[df["year"] == 2026, "total"].sum())
    return {
        "2026_stated_grand_total": stated,
        "2026_cleaned_sum": cleaned,
        "2026_matches": stated == [cleaned],
        "hour_sum_mismatches": int((df[HOUR_COLS].sum(axis=1) != df["total"]).sum()),
        "duplicate_line_days": int(df.duplicated(["date", "line"]).sum()),
        "total_boardings_all_rows": int(df["total"].sum()),
    }


def report(
    df: pd.DataFrame, file_report: dict, stations_summary: dict, spikes: dict, isochrones: dict | None = None
) -> dict:
    null_spikes = [d for d, v in zip(spikes["dates"], spikes["spike_index"], strict=True) if v is None]
    return {
        "generated_at": dt.datetime.now().isoformat(timespec="seconds"),
        "files": file_report,
        "reconciliation": reconciliation(df, file_report),
        "excluded_dates": [
            {"date": d, "reason": r, "system_boardings": int(df.loc[df["date"] == d, "total"].sum())}
            for d, r in EXCLUDED_DATES.items()
        ],
        "closures": closures(df),
        "spike_index": {
            "insufficient_baseline_days": len(null_spikes),
            "dates": null_spikes,
            "rule": "spike_index is null when fewer than 2 comparable days exist in the window",
        },
        "geodata": {
            "stations": stations_summary,
            "lines": {
                "source_crs": "EPSG:9377 (MAGNA-SIRGAS Origen Nacional), reprojected with pyproj always_xy=True",
                "line_O": "Geometry is the 'Corredor de la 80' (estado 4 and 5), the planned Metro de la 80 alignment; "
                "length and geometry are indicative of current Línea O service",
                "metroplus_lengths": "Lines 1, 2 and O lengths are indicative (BRT corridors)",
                "la_aldea": "Cable Palmitas (La Aldea) has no ridership data",
            },
            "barrios": "Medellín urban neighbourhoods only (269); other Valle de Aburrá municipalities not covered",
        },
        "unverified": [
            "Meaning of the station 'tipo' property (1 = station, 2-3 = BRT stops is inferred, not documented)",
            "Whether Línea O geometry matches the route currently operated",
            "Causes of spikes and dips (labelled as hypotheses in the UI)",
        ],
        "isochrones": isochrones or "not computed yet (run npm run isochrones)",
    }
