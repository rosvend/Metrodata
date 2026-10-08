import pandas as pd

from scripts.metro import kpis
from scripts.metro.config import CORE_LINES, HOUR_COLS, HOURS, LINE_ORDER, SPIKE_MIN_COMPARABLES, SPIKE_WINDOW_DAYS
from scripts.metro.spikes import spike_table

DAY_TYPES = ["weekday", "saturday", "sunday_holiday"]


def _r(x: float, digits: int = 1) -> float:
    return round(float(x), digits)


def ridership_hourly(df: pd.DataFrame) -> dict:
    """Columnar hourly table: row i has date dates[d[i]], line lines[ln[i]], hours v[i*20:(i+1)*20]."""
    dates = sorted(df["date"].unique())
    d_idx = {d: i for i, d in enumerate(dates)}
    l_idx = {ln: i for i, ln in enumerate(LINE_ORDER)}
    return {
        "hours": HOURS,
        "lines": LINE_ORDER,
        "dates": dates,
        "excluded_dates": sorted(df.loc[df["excluded"], "date"].unique()),
        "d": df["date"].map(d_idx).tolist(),
        "l": df["line"].map(l_idx).tolist(),
        "v": df[HOUR_COLS].to_numpy().ravel().tolist(),
    }


def daily_totals(df: pd.DataFrame) -> dict:
    """Per date system and per-line totals; null means the line did not operate (closure)."""
    wide = df.pivot(index="date", columns="line", values="total").reindex(columns=LINE_ORDER)
    meta = df.groupby("date")[["day_type", "holiday", "excluded"]].first()
    return {
        "dates": wide.index.tolist(),
        "day_type": meta["day_type"].tolist(),
        "holiday": meta["holiday"].tolist(),
        "excluded": meta["excluded"].astype(bool).tolist(),
        "system": wide.sum(axis=1).astype(int).tolist(),
        "lines": {ln: [None if pd.isna(v) else int(v) for v in wide[ln]] for ln in LINE_ORDER},
    }


def _entity_kpis(d: pd.DataFrame, km: float | None = None, indicative: bool = False) -> dict:
    prof = kpis.mean_profile(d, "weekday")
    peaks = kpis.daily_peaks(d)
    out = {
        "operating_days": len(d),
        "avg_daily_boardings": _r(d["total"].mean()),
        "avg_weekday_boardings": _r(kpis.avg_weekday_boardings(d)),
        "weekend_ratio": {k: _r(v, 4) for k, v in kpis.weekend_ratio(d).items()},
        "peak_hour_weekday": {**kpis.peak_hour_concentration(prof)},
        "peak_to_average_ratio": _r(kpis.peak_to_average_ratio(prof), 3),
        "daily_peak_median": _r(peaks.median()),
        "daily_peak_p95": _r(peaks.quantile(0.95)),
        "saturation_index": _r(kpis.saturation_index(d), 4),
    }
    out["peak_hour_weekday"]["share"] = _r(out["peak_hour_weekday"]["share"], 4)
    if km:
        out["peak_hour_load_per_km"] = _r(kpis.peak_hour_load_per_km(d, km))
        out["length_km"] = km
        out["length_indicative"] = indicative
    return out


def _record(d: pd.DataFrame) -> dict:
    hours = d[HOUR_COLS]
    date = hours.max(axis=1).idxmax()
    col = hours.loc[date].idxmax()
    return {"value": int(hours.loc[date, col]), "date": date, "hour": int(col[1:])}


def kpi_report(df: pd.DataFrame, lengths: dict[str, dict]) -> dict:
    years = sorted(df["year"].unique())
    by_year = {}
    for y in years:
        dy = df[df["year"] == y]
        shares = kpis.line_share(dy)
        lines = {}
        for ln in LINE_ORDER:
            info = lengths[ln]
            lines[ln] = {
                **_entity_kpis(kpis.days(dy, ln), info["km"], info["indicative"]),
                "line_share": _r(shares[ln], 4),
                "peak_hour_record": _record(kpis.days(dy, ln)),
            }
        by_year[int(y)] = {
            "months": sorted(pd.to_datetime(dy["date"]).dt.month.unique().tolist()),
            "system": _entity_kpis(kpis.days(dy)),
            "lines": lines,
        }

    jan_jul = {}
    for y in years:
        sys_days = kpis.jan_jul(kpis.days(df), y)
        jan_jul[int(y)] = {
            "days": len(sys_days),
            "avg_daily_boardings": _r(sys_days["total"].mean()),
            "lines": {ln: _r(kpis.jan_jul(kpis.days(df, ln), y)["total"].mean()) for ln in LINE_ORDER},
        }

    growth = {}
    for y in years[1:]:
        growth[int(y)] = {
            "vs": int(y - 1),
            "system": _r(kpis.like_for_like_growth(kpis.days(df), y), 5),
            "lines": {ln: _r(kpis.like_for_like_growth(kpis.days(df, ln), y), 5) for ln in LINE_ORDER},
        }

    return {
        "by_year": by_year,
        "jan_jul": jan_jul,
        "like_for_like_growth": growth,
        "monthly": monthly(df),
        "notes": {
            "like_for_like": "Jan-Jul only: 2025 has no Oct-Dec data and 2026 ends in July",
            "units": "boardings (a transfer passenger is counted once per line used)",
        },
    }


def monthly(df: pd.DataFrame) -> dict:
    """Mean daily boardings per calendar month, system and per line (operating days only)."""
    out = {}
    sys_days = kpis.days(df)
    for month, g in sys_days.groupby(sys_days.index.str[:7]):
        out[month] = {"days": len(g), "system": _r(g["total"].mean()), "lines": {}}
    for ln in LINE_ORDER:
        d = kpis.days(df, ln)
        for month, g in d.groupby(d.index.str[:7]):
            out[month]["lines"][ln] = _r(g["total"].mean())
    return out


def profiles(df: pd.DataFrame) -> dict:
    """Mean hourly profile per period x day_type x entity (system or line), operating days only."""
    periods = {str(y): df[df["year"] == y] for y in sorted(df["year"].unique())}
    periods.update(
        {
            f"{y}_jan_jul": df[(df["year"] == y) & (pd.to_datetime(df["date"]).dt.month <= 7)]
            for y in sorted(df["year"].unique())
        }
    )
    out = {}
    for name, dp in periods.items():
        out[name] = {}
        for t in DAY_TYPES:
            ents = {"system": kpis.mean_profile(kpis.days(dp), t)}
            ents.update({ln: kpis.mean_profile(kpis.days(dp, ln), t) for ln in LINE_ORDER})
            out[name][t] = {k: [_r(v) for v in p.tolist()] for k, p in ents.items()}
    return {"hours": HOURS, "periods": out}


def peak_distributions(df: pd.DataFrame) -> dict:
    """Weekday daily peak-hour volume per line and year (saturation view)."""
    out = {}
    for ln in LINE_ORDER:
        d = kpis.days(df, ln)
        wk = d[d["day_type"] == "weekday"]
        hours = wk[HOUR_COLS]
        out[ln] = {
            "dates": wk.index.tolist(),
            "peak": hours.max(axis=1).astype(int).tolist(),
            "hour": [int(c[1:]) for c in hours.idxmax(axis=1)],
        }
    return {"day_type": "weekday", "lines": out}


def spikes(df: pd.DataFrame) -> dict:
    core = df[df["line"].isin(CORE_LINES)]
    d = kpis.days(core)
    t = spike_table(d)
    meta = df.groupby("date")[["holiday"]].first()
    return {
        "lines_used": CORE_LINES,
        "window_days": SPIKE_WINDOW_DAYS,
        "min_comparables": SPIKE_MIN_COMPARABLES,
        "dates": t.index.tolist(),
        "day_type": d["day_type"].tolist(),
        "holiday": meta.loc[t.index, "holiday"].tolist(),
        "actual": t["actual"].tolist(),
        "expected": [None if pd.isna(v) else _r(v) for v in t["expected"]],
        "n_comparables": t["n_comparables"].tolist(),
        "spike_index": [None if pd.isna(v) else _r(v, 2) for v in t["spike_index"]],
    }
