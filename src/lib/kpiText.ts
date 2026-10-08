// Plain-language definitions shown in info tips; they mirror docs/kpis.md
export const KPI_TEXT = {
  avg_weekday_boardings:
    "Mean daily boardings on weekdays (not Saturdays, Sundays or holidays), over days the line ran.",
  line_share:
    "This line's mean weekday boardings divided by the sum over all lines. Transfers count once per line boarded.",
  peak_hour:
    "The busiest one-hour band of the average weekday, and the share of the day's boardings that happen in it.",
  peak_to_average:
    "Busiest hour divided by the mean of operating hours (hours with more than 0.5% of the day). Higher means a sharper peak.",
  load_per_km:
    "Median weekday peak-hour boardings divided by line length. A proxy for pressure on the line: boardings are counted at entry, not onboard load.",
  saturation_index:
    "P95 ÷ median of the weekday peak-hour volume. Values near 1 mean the peak barely varies day to day, which can indicate a capacity ceiling. A proxy only: the data has no capacity, headway or onboard counts.",
  weekend_ratio: "Mean Saturday (or Sunday & holiday) boardings as a share of mean weekday boardings.",
} as const;
