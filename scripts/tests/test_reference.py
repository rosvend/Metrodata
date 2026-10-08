"""Real-data regression against the reference values in the project brief (tolerance 0.5%)."""

import pytest

from scripts.metro import kpis
from scripts.metro.config import CORE_LINES, HOUR_COLS
from scripts.metro.pipeline import load_ridership
from scripts.metro.spikes import spike_table

REL = 0.005


@pytest.fixture(scope="module")
def data():
    return load_ridership()


@pytest.fixture(scope="module")
def df(data):
    return data[0]


def test_total_boardings(df):
    assert df["total"].sum() == 773_019_001


def test_2026_reconciles_with_stated_grand_total(df, data):
    assert df.loc[df["year"] == 2026, "total"].sum() == 185_914_886
    summary = next(r for r in data[1][2026]["rules"] if r["rule"] == "drop_summary_rows")
    assert summary["summary_totals"] == [185_914_886]


def test_hour_columns_sum_to_row_total(df):
    assert (df[HOUR_COLS].sum(axis=1) == df["total"]).all()


def test_no_duplicate_line_days(df):
    assert not df.duplicated(["date", "line"]).any()


def test_known_missing_and_excluded_dates(df, data):
    assert data[1][2024]["missing_dates"] == ["2024-01-15"]
    assert data[1][2025]["missing_dates"] == [] and data[1][2026]["missing_dates"] == []
    assert set(df.loc[df["excluded"], "date"]) == {"2024-02-20"}


@pytest.mark.parametrize("year,expected", [(2024, 894_007), (2025, 913_899), (2026, 876_957)])
def test_jan_jul_avg_daily(df, year, expected):
    assert kpis.jan_jul(kpis.days(df), year)["total"].mean() == pytest.approx(expected, rel=REL)


def test_line_a_share_2026_weekday(df):
    d26 = df[df["year"] == 2026]
    assert kpis.line_share(d26)["A"] == pytest.approx(0.649, rel=REL)
    assert kpis.avg_weekday_boardings(kpis.days(d26, "A")) == pytest.approx(683_400, rel=REL)


def test_system_weekday_peak_is_17h(df):
    peak = kpis.peak_hour_concentration(kpis.mean_profile(kpis.days(df), "weekday"))
    assert peak["hour"] == 17
    assert peak["share"] == pytest.approx(0.104, rel=REL)


@pytest.mark.parametrize("year,expected", [(2024, 88_600), (2025, 89_600), (2026, 89_000)])
def test_line_a_peak_hour_record(df, year, expected):
    a = kpis.days(df[df["year"] == year], "A")
    assert a[HOUR_COLS].max().max() == pytest.approx(expected, rel=REL)


@pytest.fixture(scope="module")
def spikes(df):
    return spike_table(kpis.days(df[df["line"].isin(CORE_LINES)]))


def test_spike_extremes(spikes):
    s = spikes["spike_index"].dropna()
    assert s.idxmax() == "2024-12-22" and s.max() == pytest.approx(35.1, abs=0.05)
    assert s.idxmin() == "2026-06-21" and s.min() == pytest.approx(-64.8, abs=0.05)


def test_election_sundays_are_lowest_days_of_2026(df):
    d = kpis.days(df[df["year"] == 2026])["total"]
    assert set(d.nsmallest(3).index) == {"2026-03-08", "2026-05-31", "2026-06-21"}
