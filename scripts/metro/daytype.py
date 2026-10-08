from functools import cache

import holidays
import pandas as pd


@cache
def _colombia(year: int) -> holidays.HolidayBase:
    return holidays.Colombia(years=year)


def holiday_name(iso_date: str) -> str | None:
    d = pd.Timestamp(iso_date).date()
    return _colombia(d.year).get(d)


def day_type(iso_date: str) -> str:
    d = pd.Timestamp(iso_date)
    if d.weekday() == 6 or holiday_name(iso_date):
        return "sunday_holiday"
    return "saturday" if d.weekday() == 5 else "weekday"
