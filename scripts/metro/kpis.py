import pandas as pd

from scripts.metro.config import HOUR_COLS, JAN_JUL_MONTHS, OPERATING_HOUR_MIN_SHARE

COLS = [*HOUR_COLS, "total"]


def days(df: pd.DataFrame, line: str | None = None) -> pd.DataFrame:
    """Per-date frame (hours, total, day_type) for one line or the system, KPI-eligible days only."""
    df = df[~df["excluded"]]
    if line is not None:
        return df[df["line"] == line].set_index("date")[[*COLS, "day_type"]].sort_index()
    out = df.groupby("date")[COLS].sum()
    out["day_type"] = df.groupby("date")["day_type"].first()
    return out.sort_index()


def avg_weekday_boardings(d: pd.DataFrame) -> float:
    return float(d.loc[d["day_type"] == "weekday", "total"].mean())


def weekend_ratio(d: pd.DataFrame) -> dict[str, float]:
    wk = avg_weekday_boardings(d)
    return {t: float(d.loc[d["day_type"] == t, "total"].mean() / wk) for t in ("saturday", "sunday_holiday")}


def jan_jul(d: pd.DataFrame, year: int) -> pd.DataFrame:
    idx = pd.to_datetime(d.index)
    return d[(idx.year == year) & idx.month.isin(JAN_JUL_MONTHS)]


def like_for_like_growth(d: pd.DataFrame, year: int) -> float:
    return float(jan_jul(d, year)["total"].mean() / jan_jul(d, year - 1)["total"].mean() - 1)


def line_share(df: pd.DataFrame) -> dict[str, float]:
    means = {line: avg_weekday_boardings(days(df, line)) for line in df["line"].unique()}
    total = sum(means.values())
    return {line: m / total for line, m in means.items()}


def mean_profile(d: pd.DataFrame, day_type: str) -> pd.Series:
    return d.loc[d["day_type"] == day_type, HOUR_COLS].mean()


def peak_hour_concentration(profile: pd.Series) -> dict:
    col = profile.idxmax()
    return {"hour": int(col[1:]), "share": float(profile[col] / profile.sum())}


def peak_to_average_ratio(profile: pd.Series) -> float:
    operating = profile[profile > OPERATING_HOUR_MIN_SHARE * profile.sum()]
    return float(profile.max() / operating.mean())


def daily_peaks(d: pd.DataFrame, day_type: str = "weekday") -> pd.Series:
    return d.loc[d["day_type"] == day_type, HOUR_COLS].max(axis=1)


def peak_hour_load_per_km(d: pd.DataFrame, km: float) -> float:
    return float(daily_peaks(d).median() / km)


def saturation_index(d: pd.DataFrame) -> float:
    peaks = daily_peaks(d)
    return float(peaks.quantile(0.95) / peaks.median())
