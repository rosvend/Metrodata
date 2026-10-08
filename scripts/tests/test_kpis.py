import pandas as pd
import pytest

from scripts.metro import kpis
from scripts.metro.config import HOUR_COLS


def _rows(spec):
    """spec: list of (date, line, day_type, {hour_col: value})."""
    out = []
    for date, line, dtype, hours in spec:
        row = {"date": date, "line": line, "day_type": dtype, "excluded": False, **{c: 0 for c in HOUR_COLS}}
        row.update(hours)
        row["total"] = sum(row[c] for c in HOUR_COLS)
        out.append(row)
    return pd.DataFrame(out)


@pytest.fixture
def df():
    return _rows(
        [
            ("2025-01-06", "A", "weekday", {"h07": 60, "h17": 40}),
            ("2025-01-06", "B", "weekday", {"h07": 10, "h17": 30}),
            ("2025-01-07", "A", "weekday", {"h07": 100, "h17": 100}),
            ("2025-01-11", "A", "saturday", {"h10": 50}),
            ("2025-01-12", "A", "sunday_holiday", {"h10": 25}),
        ]
    )


def test_days_system_sums_lines(df):
    d = kpis.days(df)
    assert d.loc["2025-01-06", "total"] == 140
    assert d.loc["2025-01-06", "day_type"] == "weekday"


def test_days_line_uses_operating_days_only(df):
    d = kpis.days(df, "B")
    assert list(d.index) == ["2025-01-06"]


def test_days_drops_excluded(df):
    df.loc[0, "excluded"] = True
    assert kpis.days(df, "A").loc["2025-01-06":"2025-01-06"].empty


def test_avg_weekday_boardings(df):
    assert kpis.avg_weekday_boardings(kpis.days(df)) == pytest.approx((140 + 200) / 2)
    assert kpis.avg_weekday_boardings(kpis.days(df, "B")) == 40


def test_weekend_ratio(df):
    r = kpis.weekend_ratio(kpis.days(df, "A"))
    assert r["saturday"] == pytest.approx(50 / 150)
    assert r["sunday_holiday"] == pytest.approx(25 / 150)


def test_line_share(df):
    s = kpis.line_share(df)
    assert s["A"] == pytest.approx(150 / 190)
    assert s["B"] == pytest.approx(40 / 190)


def test_like_for_like_growth_uses_jan_jul_only():
    df = _rows(
        [
            ("2024-03-01", "A", "weekday", {"h07": 100}),
            ("2025-03-01", "A", "weekday", {"h07": 110}),
            ("2025-08-01", "A", "weekday", {"h07": 9999}),
        ]
    )
    assert kpis.like_for_like_growth(kpis.days(df), 2025) == pytest.approx(0.10)


def test_mean_profile_and_peak_hour_concentration(df):
    prof = kpis.mean_profile(kpis.days(df, "A"), "weekday")
    assert prof["h07"] == 80 and prof["h17"] == 70
    peak = kpis.peak_hour_concentration(prof)
    assert peak == {"hour": 7, "share": pytest.approx(80 / 150)}


def test_peak_to_average_ignores_non_operating_hours():
    prof = pd.Series({c: 0.0 for c in HOUR_COLS})
    prof["h05"], prof["h06"], prof["h07"] = 100, 200, 300
    prof["h23"] = 1  # below 0.5% of 601: not an operating hour
    assert kpis.peak_to_average_ratio(prof) == pytest.approx(300 / 200)


def test_daily_peaks_and_load_per_km(df):
    d = kpis.days(df, "A")
    assert list(kpis.daily_peaks(d, "weekday")) == [60, 100]
    assert kpis.peak_hour_load_per_km(d, km=2.0) == pytest.approx(80 / 2.0)


def test_saturation_index():
    spec = [(f"2025-01-{i:02d}", "A", "weekday", {"h07": v}) for i, v in enumerate([90, 100, 100, 100, 100], 1)]
    d = kpis.days(_rows(spec))
    assert kpis.saturation_index(d) == pytest.approx(100 / 100)
