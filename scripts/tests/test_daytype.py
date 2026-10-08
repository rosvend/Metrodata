from scripts.metro.daytype import day_type, holiday_name


def test_weekday():
    assert day_type("2026-07-15") == "weekday"


def test_saturday():
    assert day_type("2026-07-18") == "saturday"


def test_sunday():
    assert day_type("2026-07-19") == "sunday_holiday"


def test_colombian_holiday_on_weekday_counts_as_sunday_holiday():
    assert day_type("2024-01-08") == "sunday_holiday"
    assert day_type("2026-07-20") == "sunday_holiday"


def test_holiday_name():
    assert holiday_name("2026-07-20") is not None
    assert holiday_name("2026-07-15") is None


def test_holiday_name_in_spanish_and_english():
    assert holiday_name("2024-07-20", "es") == "Día de la Independencia"
    assert holiday_name("2024-07-20", "en_US") == "Independence Day"
