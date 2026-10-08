from scripts.metro.drivers import driver


def test_election_day_comes_first():
    assert driver("2026-05-31", None) == ("election", "Election day")


def test_public_holiday_uses_its_name():
    assert driver("2025-01-01", "Año Nuevo") == ("holiday", "Public holiday: Año Nuevo")


def test_feria_de_las_flores_window():
    assert driver("2025-08-10", None)[0] == "feria"
    assert driver("2024-08-11", None)[0] == "feria"
    assert driver("2025-08-20", None)[0] != "feria"


def test_christmas_season_spans_new_year():
    assert driver("2024-12-22", None)[0] == "christmas"
    assert driver("2024-12-14", None)[0] == "christmas"


def test_long_weekend_next_to_a_monday_holiday():
    # 2025-06-30 (Monday) is San Pedro y San Pablo
    assert driver("2025-06-29", None)[0] == "long_weekend"
    assert driver("2025-06-28", None)[0] == "long_weekend"


def test_no_rule_matches():
    assert driver("2025-03-12", None) == ("none", "No obvious driver")


def test_missing_holiday_values_are_ignored():
    assert driver("2025-03-12", float("nan")) == ("none", "No obvious driver")


def test_eves_and_new_year_period():
    assert driver("2024-12-24", None) == ("christmas_eve", "Christmas Eve")
    assert driver("2024-12-31", None) == ("new_years_eve", "New Year's Eve")
    assert driver("2026-01-02", None) == ("new_year", "New Year period")


def test_holy_week_saturday():
    assert driver("2025-04-19", None) == ("holy_week", "Holy Week")
    assert driver("2024-03-30", None) == ("holy_week", "Holy Week")
