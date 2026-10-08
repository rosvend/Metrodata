import datetime as dt

import pandas as pd

from scripts.metro.config import EXCLUDED_DATES, HOUR_COLS


def line_id(label: str) -> str:
    return str(label).strip().upper().replace("LÍNEA", "").strip()


def _parse_one(value) -> str:
    if isinstance(value, (dt.datetime, pd.Timestamp)):
        return value.strftime("%Y-%m-%d")
    return dt.datetime.strptime(str(value).strip(), "%d.%m.%Y").strftime("%Y-%m-%d")


def parse_dates(values: pd.Series) -> pd.Series:
    return values.map(_parse_one)


def _is_summary(row: pd.Series) -> bool:
    return any("resultado" in str(v).lower() for v in (row["dia"], row["linea"]))


def clean_raw(raw: pd.DataFrame) -> tuple[pd.DataFrame, list[dict]]:
    """Turn raw rows (dia, linea, h04..h23, total) into a tidy validated frame plus a rule log."""
    log = []
    summary = raw.apply(_is_summary, axis=1)
    log.append(
        {
            "rule": "drop_summary_rows",
            "rows": int(summary.sum()),
            "summary_totals": [float(t) for t in raw.loc[summary, "total"]],
        }
    )
    df = raw[~summary]

    empty = df["dia"].isna() & df["linea"].isna()
    log.append({"rule": "drop_empty_rows", "rows": int(empty.sum())})
    df = df[~empty]

    filled = int(df[HOUR_COLS].isna().sum().sum())
    out = pd.DataFrame({"date": parse_dates(df["dia"]).to_numpy(), "line": df["linea"].map(line_id).to_numpy()})
    out[HOUR_COLS] = df[HOUR_COLS].fillna(0).astype("int64").to_numpy()
    out["total"] = df["total"].astype("int64").to_numpy()
    log.append(
        {
            "rule": "empty_hour_cells_as_zero",
            "cells": filled,
            "note": "Only inside existing line-days; missing line-days are closures and are never imputed",
        }
    )

    mismatch = out[HOUR_COLS].sum(axis=1) != out["total"]
    if mismatch.any():
        raise ValueError(f"hour sum differs from total in {int(mismatch.sum())} rows")
    dups = out.duplicated(["date", "line"])
    if dups.any():
        raise ValueError(f"{int(dups.sum())} duplicate (date, line) rows")

    out["excluded"] = out["date"].isin(EXCLUDED_DATES)
    log.append(
        {
            "rule": "exclude_anomalous_dates",
            "rows": int(out["excluded"].sum()),
            "dates": {d: r for d, r in EXCLUDED_DATES.items() if d in set(out["date"])},
        }
    )
    return out, log
