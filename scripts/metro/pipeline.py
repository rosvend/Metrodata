import pandas as pd

from scripts.metro.clean import clean_raw
from scripts.metro.config import COVERAGE, RIDERSHIP_FILES
from scripts.metro.daytype import day_type, holiday_name
from scripts.metro.ingest import read_ridership


def load_ridership() -> tuple[pd.DataFrame, dict]:
    """Read, clean and enrich all ridership files. Returns tidy frame and per-file quality log."""
    frames, report = [], {}
    for year, path in RIDERSHIP_FILES.items():
        df, log = clean_raw(read_ridership(path))
        start, end = COVERAGE[year]
        expected = pd.date_range(start, end).strftime("%Y-%m-%d")
        outside = df[(df["date"] < start) | (df["date"] > end)]
        if not outside.empty:
            raise ValueError(f"{path.name}: {len(outside)} rows outside expected coverage")
        report[year] = {
            "file": path.name,
            "rows": len(df),
            "total_boardings": int(df["total"].sum()),
            "coverage": [start, end],
            "missing_dates": sorted(set(expected) - set(df["date"])),
            "rules": log,
        }
        frames.append(df)
    df = pd.concat(frames, ignore_index=True)
    if df.duplicated(["date", "line"]).any():
        raise ValueError("duplicate (date, line) rows across files")
    dates = pd.Series(df["date"].unique())
    types = dict(zip(dates, dates.map(day_type), strict=True))
    names = dict(zip(dates, dates.map(holiday_name), strict=True))
    df["day_type"] = df["date"].map(types)
    df["holiday"] = df["date"].map(names)
    df["year"] = df["date"].str[:4].astype(int)
    return df.sort_values(["date", "line"]).reset_index(drop=True), report
