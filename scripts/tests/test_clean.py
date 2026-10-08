import datetime as dt

import pandas as pd
import pytest

from scripts.metro.clean import clean_raw, line_id, parse_dates
from scripts.metro.config import HOUR_COLS


def _raw(rows):
    return pd.DataFrame(rows, columns=["dia", "linea", *HOUR_COLS, "total"])


def _row(dia, linea, hours, total):
    vals = list(hours) + [None] * (20 - len(hours))
    return [dia, linea, *vals, total]


def test_line_id_normalizes_labels():
    assert line_id("LÍNEA A") == "A"
    assert line_id("LÍNEA T-A") == "T-A"
    assert line_id(" LÍNEA 1 ") == "1"


def test_parse_dates_handles_text_and_datetime():
    s = pd.Series(["01.02.2024", dt.datetime(2025, 3, 4), pd.Timestamp("2026-05-06")])
    assert list(parse_dates(s)) == ["2024-02-01", "2025-03-04", "2026-05-06"]


def test_clean_drops_summary_and_empty_rows_and_logs():
    raw = _raw(
        [
            _row(dt.datetime(2026, 1, 1), "LÍNEA A", [10, 20], 30),
            _row("Resultado total", None, [], 30),
            _row(None, None, [], None),
        ]
    )
    df, log = clean_raw(raw)
    assert len(df) == 1
    rules = {e["rule"]: e.get("rows") for e in log}
    assert rules["drop_summary_rows"] == 1
    assert rules["drop_empty_rows"] == 1


def test_clean_fills_missing_hours_with_zero_inside_operating_day():
    raw = _raw([_row("02.01.2024", "LÍNEA L", [None, 5, 7], 12)])
    df, _ = clean_raw(raw)
    assert df.loc[0, "h04"] == 0
    assert df.loc[0, "h05"] == 5
    assert df.loc[0, "total"] == 12
    assert df.loc[0, "line"] == "L"
    assert df.loc[0, "date"] == "2024-01-02"


def test_clean_does_not_invent_missing_line_days():
    raw = _raw([_row("02.01.2024", "LÍNEA A", [1], 1)])
    df, _ = clean_raw(raw)
    assert set(df["line"]) == {"A"}


def test_clean_rejects_hour_sum_mismatch():
    raw = _raw([_row("02.01.2024", "LÍNEA A", [1, 2], 99)])
    with pytest.raises(ValueError, match="hour sum"):
        clean_raw(raw)


def test_clean_rejects_duplicate_line_days():
    raw = _raw([_row("02.01.2024", "LÍNEA A", [1], 1), _row("02.01.2024", "LÍNEA A", [1], 1)])
    with pytest.raises(ValueError, match="duplicate"):
        clean_raw(raw)


def test_clean_flags_excluded_dates():
    raw = _raw([_row("20.02.2024", "LÍNEA A", [1], 1), _row("21.02.2024", "LÍNEA A", [1], 1)])
    df, _ = clean_raw(raw)
    assert df.set_index("date")["excluded"].to_dict() == {"2024-02-20": True, "2024-02-21": False}
