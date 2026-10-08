import numpy as np
import pandas as pd

from scripts.metro.config import HOUR_COLS, SPIKE_MIN_COMPARABLES, SPIKE_WINDOW_DAYS


def _comparables(d: pd.DataFrame) -> list[np.ndarray]:
    """For each date, a mask of same weekday + same day_type dates within the window, excluding itself."""
    dates = pd.to_datetime(d.index)
    types = d["day_type"].to_numpy()
    masks = []
    for i, day in enumerate(dates):
        gap = np.abs((dates - day).days)
        masks.append((gap <= SPIKE_WINDOW_DAYS) & (gap > 0) & (dates.weekday == day.weekday()) & (types == types[i]))
    return masks


def spike_table(d: pd.DataFrame) -> pd.DataFrame:
    """Per date: actual, expected (median of same weekday + day_type within the window), n, spike_index %."""
    totals = d["total"].to_numpy()
    rows = []
    for i, mask in enumerate(_comparables(d)):
        n = int(mask.sum())
        expected = float(np.median(totals[mask])) if n >= SPIKE_MIN_COMPARABLES else np.nan
        index = (totals[i] / expected - 1) * 100
        rows.append({"actual": int(totals[i]), "expected": expected, "n_comparables": n, "spike_index": index})
    return pd.DataFrame(rows, index=d.index)


def expected_profiles(d: pd.DataFrame) -> pd.DataFrame:
    """Hour-by-hour median over the same comparable days used by spike_table (NaN when too few)."""
    hours = d[HOUR_COLS].to_numpy(dtype=float)
    out = np.full(hours.shape, np.nan)
    for i, mask in enumerate(_comparables(d)):
        if mask.sum() >= SPIKE_MIN_COMPARABLES:
            out[i] = np.median(hours[mask], axis=0)
    return pd.DataFrame(out, index=d.index, columns=HOUR_COLS)
