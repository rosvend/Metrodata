import numpy as np
import pandas as pd

from scripts.metro.config import SPIKE_MIN_COMPARABLES, SPIKE_WINDOW_DAYS


def spike_table(d: pd.DataFrame) -> pd.DataFrame:
    """Per date: actual, expected (median of same weekday + day_type within the window), n, spike_index %."""
    dates = pd.to_datetime(d.index)
    totals, types = d["total"].to_numpy(), d["day_type"].to_numpy()
    rows = []
    for i, day in enumerate(dates):
        gap = np.abs((dates - day).days)
        mask = (gap <= SPIKE_WINDOW_DAYS) & (gap > 0) & (dates.weekday == day.weekday()) & (types == types[i])
        n = int(mask.sum())
        expected = float(np.median(totals[mask])) if n >= SPIKE_MIN_COMPARABLES else np.nan
        index = (totals[i] / expected - 1) * 100
        rows.append({"actual": int(totals[i]), "expected": expected, "n_comparables": n, "spike_index": index})
    return pd.DataFrame(rows, index=d.index)
