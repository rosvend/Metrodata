from functools import cache

import holidays
import pandas as pd

# English names are the default in outputs; Spanish names are published alongside for the UI
DEFAULT_LANGUAGE = "en_US"


@cache
def _colombia(year: int, language: str) -> holidays.HolidayBase:
    return holidays.Colombia(years=year, language=language)


def holiday_name(iso_date: str, language: str = DEFAULT_LANGUAGE) -> str | None:
    d = pd.Timestamp(iso_date).date()
    return _colombia(d.year, language).get(d)


def day_type(iso_date: str) -> str:
    d = pd.Timestamp(iso_date)
    if d.weekday() == 6 or holiday_name(iso_date):
        return "sunday_holiday"
    return "saturday" if d.weekday() == 5 else "weekday"
