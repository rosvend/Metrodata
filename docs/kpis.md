# KPI definitions

All KPIs are pure functions in `scripts/metro/kpis.py`. They operate on a per-date "days" frame (`kpis.days(df, line)`) that:
- contains operating days only (closures are absent rather than zero);
- excludes 2024-02-20;
- for the system, sums all lines operating that day.

| KPI | Definition | Caveat |
|---|---|---|
| avg_weekday_boardings | Mean daily boardings over weekday-type days | Boardings, not unique passengers |
| weekend_ratio | Mean saturday (and sunday_holiday) volume / mean weekday volume | Two values |
| like_for_like_growth | Mean daily Jan–Jul of Y / Jan–Jul of Y−1 − 1 | Jan–Jul only, because Q4 2025 is missing |
| line_share | Line mean weekday / sum of line means | Transfers are counted on each line |
| peak_hour_concentration | Max hour of the mean weekday profile / profile total | Reported as {hour, share} |
| peak_to_average_ratio | Max hour / mean of operating hours (> 0.5% of the daily total) | Mean weekday profile |
| peak_hour_load_per_km | Median weekday daily max-hour boardings / line km | Indicative km for 1, 2, O. Boardings are not load |
| saturation_index | P95 / median of weekday daily peak-hour volume | **Proxy.** A value near 1 means the peak barely varies, which may indicate a capacity cap. There is no capacity data |
| spike_index | (core total / expected − 1) × 100 | Core lines A, B, T-A, 1, 2, O, P. Expected = median of the same weekday and day_type within ±35 days (day itself excluded). Null when there are fewer than 2 comparables |

## Why the spike rule needs at least 2 comparables
Holidays that fall on a weekday often have only one comparable day in the window. For example, 2024-01-08 (Reyes, Monday) is compared only with 2024-01-01 (New Year), which gives an artificial +51.3%. Requiring at least 2 comparables nulls 24 such days and reproduces the brief's reference extremes. This was decided by the project owner.

## Year scope
`by_year` figures use whatever months exist in each year (2024: 12, 2025: 9, 2026: 7). They must not be compared across years. All YoY comparisons use `jan_jul` / `like_for_like_growth`.
