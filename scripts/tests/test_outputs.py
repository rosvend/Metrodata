import pandas as pd

from scripts.metro import outputs
from scripts.metro.config import HOUR_COLS


def _df():
    rows = []
    for date, line, total_h7 in [("2025-01-06", "A", 10), ("2025-01-06", "L", 3), ("2025-01-07", "A", 12)]:
        r = {
            "date": date,
            "line": line,
            "day_type": "weekday",
            "holiday": None,
            "excluded": False,
            "year": 2025,
            **{c: 0 for c in HOUR_COLS},
        }
        r["h07"] = total_h7
        r["total"] = total_h7
        rows.append(r)
    return pd.DataFrame(rows)


def test_ridership_hourly_round_trips():
    df = _df()
    out = outputs.ridership_hourly(df)
    i = 1
    assert out["dates"][out["d"][i]] == "2025-01-06"
    assert out["lines"][out["l"][i]] == "L"
    assert out["v"][i * 20 + 3] == 3  # h07 is the 4th hour band
    assert len(out["v"]) == 20 * len(df)


def test_daily_totals_keeps_closures_as_null():
    out = outputs.daily_totals(_df())
    assert out["system"] == [13, 12]
    assert out["lines"]["L"] == [3, None]
