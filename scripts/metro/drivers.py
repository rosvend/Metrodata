"""Rule-based *hypotheses* for why a day deviates. They are labels to verify, not proven causes."""

import datetime as dt

from dateutil.easter import easter

from scripts.metro.daytype import holiday_name

# From the project brief
ELECTION_DAYS = {"2026-03-08", "2026-05-31", "2026-06-21"}

# Feria de las Flores, Medellín (public event calendar; verify before citing)
FERIA_WINDOWS = [("2024-08-02", "2024-08-11"), ("2025-08-01", "2025-08-10")]

# Christmas lights season (Alumbrados) runs through December; early January is the New Year break
NEW_YEAR_TO = (1, 6)

LABELS = {
    "election": "Election day",
    "feria": "Feria de las Flores",
    "christmas": "Christmas lights",
    "christmas_eve": "Christmas Eve",
    "new_years_eve": "New Year's Eve",
    "new_year": "New Year period",
    "holy_week": "Holy Week",
    "long_weekend": "Long weekend",
    "none": "No obvious driver",
}


def _holy_week(d: dt.date) -> bool:
    """Maundy Thursday through Easter Sunday."""
    sunday = easter(d.year)
    return sunday - dt.timedelta(days=3) <= d <= sunday


def _next_to_monday_holiday(d: dt.date) -> bool:
    """Saturday or Sunday whose following Monday is a public holiday (a 'puente')."""
    if d.weekday() not in (5, 6):
        return False
    monday = d + dt.timedelta(days=7 - d.weekday())
    return holiday_name(monday.isoformat()) is not None


def _calendar_key(d: dt.date) -> str | None:
    if (d.month, d.day) == (12, 24):
        return "christmas_eve"
    if (d.month, d.day) == (12, 31):
        return "new_years_eve"
    if d.month == 12:
        return "christmas"
    if (d.month, d.day) <= NEW_YEAR_TO:
        return "new_year"
    if _holy_week(d):
        return "holy_week"
    return None


def driver(iso: str, holiday: object) -> tuple[str, str]:
    """(key, label) of the first matching rule, in priority order. `holiday` may be None or NaN."""
    d = dt.date.fromisoformat(iso)
    if iso in ELECTION_DAYS:
        return "election", LABELS["election"]
    if isinstance(holiday, str) and holiday:
        return "holiday", f"Public holiday: {holiday}"
    if any(a <= iso <= b for a, b in FERIA_WINDOWS):
        return "feria", LABELS["feria"]
    key = _calendar_key(d)
    if key:
        return key, LABELS[key]
    if _next_to_monday_holiday(d):
        return "long_weekend", LABELS["long_weekend"]
    return "none", LABELS["none"]
