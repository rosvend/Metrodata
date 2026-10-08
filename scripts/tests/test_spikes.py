import math

import pandas as pd
import pytest

from scripts.metro.spikes import spike_table


def _days(spec):
    return pd.DataFrame(spec, columns=["date", "total", "day_type"]).set_index("date")


def test_expected_is_median_of_same_weekday_and_day_type_in_window():
    d = _days(
        [
            ("2025-03-03", 100, "weekday"),
            ("2025-03-10", 120, "weekday"),
            ("2025-03-17", 200, "weekday"),
            ("2025-03-24", 140, "weekday"),
            ("2025-03-11", 999, "weekday"),  # other weekday: ignored
            ("2025-03-31", 999, "sunday_holiday"),  # same weekday, other day_type: ignored
            ("2025-06-02", 999, "weekday"),  # outside +/-35 days: ignored
        ]
    )
    row = spike_table(d).loc["2025-03-17"]
    assert row["expected"] == 120
    assert row["n_comparables"] == 3
    assert row["spike_index"] == pytest.approx((200 / 120 - 1) * 100)


def test_fewer_than_two_comparables_gives_null():
    d = _days([("2025-03-03", 100, "sunday_holiday"), ("2025-03-10", 150, "sunday_holiday")])
    row = spike_table(d).loc["2025-03-10"]
    assert row["n_comparables"] == 1
    assert math.isnan(row["spike_index"])
