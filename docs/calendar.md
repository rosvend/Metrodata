# Page 3: Calendar and spikes (Phase 6)

## Data (pipeline)
- `spikes.json` per date (core lines A, B, T-A, 1, 2, O, P):
  - `actual`, `expected`, `n_comparables`, `spike_index`;
  - `holiday`;
  - `driver` / `driver_label`, the "likely driver" hypothesis.
- `spike_profiles.json` per date:
  - core-line boardings for each hour band;
  - the expected hourly profile, which is the per-hour median of the **same comparable days** used for the spike index (`spikes._comparables`). It is null when there are fewer than 2 comparables.

## Driver hypotheses (`scripts/metro/drivers.py`)
These are labels to verify, not causes. The UI always shows "(hypothesis)". The first matching rule wins:
1. **Election day:** 2026-03-08, 2026-05-31, 2026-06-21 (from the project brief).
2. **Public holiday:** official Colombian holiday name from the `holidays` package.
3. **Feria de las Flores:** 2024-08-02..11 and 2025-08-01..10. **External fact added by us; verify before citing.**
4. **Calendar periods:**
   - Christmas Eve (Dec 24);
   - New Year's Eve (Dec 31);
   - Christmas lights (the rest of December);
   - New Year period (Jan 1–6);
   - Holy Week (Maundy Thursday to Easter Sunday, from `dateutil.easter`).
5. **Long weekend:** a Saturday or Sunday followed by a Monday holiday.
6. Otherwise, "No obvious driver".

## Views
| Card | Chart | Notes |
|---|---|---|
| Year, day by day | Calendar heat map (weeks × weekdays), diverging coral → neutral → green, clamped at ±40% | Every day type is shown, since each is compared only with its own kind. Grey outline: too few comparables. Dashed red: excluded day. Empty: missing from the source |
| Biggest spikes and dips | Ranked lists with inline bars and hypothesis tags | Top 5 each, for the selected year |
| The day against its expected hours | Line (actual) over a dashed line and band (expected) | Opened by clicking the calendar or the list |
| Like-for-like trend | Dumbbell per month, 2024/2025/2026 (Jan–Jul); diverging bars of hourly change 2026 vs 2025 (Jan–Jul, selected day type) | The caveat is always shown. Headline growth comes from `like_for_like_growth` |

## Deep links
- `?date=YYYY-MM-DD` selects a day. A link without `year` adopts the date's year.
- Changing the year in the top bar ignores a date from another year and falls back to that year's biggest spike.
- `node scripts/ui/calendar-check.mjs` verifies:
  - the deep link;
  - that a list click updates the URL;
  - the hover tooltip;
  - no console errors.

## Verified
- 2024-12-22 shows +35.1%: 573,128 boardings against 424,341 expected (reference value).
- The largest dips are the three 2026 election Sundays (−64.8%, −64.4%, −62.2%).
