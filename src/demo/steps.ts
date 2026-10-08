import { formatDate, formatInt, formatPercent } from "../lib/format";
import type { DemoFacts } from "./facts";

export interface DemoStep {
  url: string;
  title: string;
  caption: string;
  // Card to scroll into view when the page is taller than the screen
  anchor?: string;
}

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const pct = (v: number) => formatPercent(v);
const signed = (v: number) => `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}%`;

// The guided tour: each step is a URL (page + view state) and a short narration built from the data
export function demoSteps(f: DemoFacts): DemoStep[] {
  return [
    {
      url: "/?year=2026&day=weekday&hour=17",
      title: "The network at the evening peak",
      caption: `An average 2026 weekday at ${hh(f.systemPeakHour)}, the busiest hour (${pct(f.systemPeakShare)} of the day's boardings). Line A alone carries ${pct(f.lineAShare)} of weekday boardings.`,
    },
    {
      url: "/?year=2026&day=weekday&metric=share&hour=4&play=1",
      title: "Every line has its own day",
      caption: `Widths now show each line's share of its own day. Metrocable lines peak at ${hh(f.cablePeakHour)}, earlier than the rest of the network; the city-wide peak comes in the evening.`,
    },
    {
      url: "/?year=2026&day=weekday&line=A&hour=17",
      title: "Line A in detail",
      caption: `${formatInt(f.lineAWeekday)} boardings on an average weekday, peaking at ${hh(f.lineAPeakHour)} with ${pct(f.lineAPeakShare)} of the day. A passenger who changes lines is counted once on each line.`,
    },
    {
      url: "/peaks?year=2026&day=weekday",
      title: "When the network strains",
      anchor: "Line × hour",
      caption: `The heatmap shows each line's rhythm: cable lines are sharpest at dawn, while Arví (L) stays flat all day (peak ÷ average ${f.arviPeakToAverage.toFixed(2)}).`,
    },
    {
      url: "/peaks?year=2026&day=weekday",
      title: "A possible ceiling on Line A",
      anchor: "Saturation (proxy)",
      caption: `Line A's busiest hour barely changes from one weekday to the next: the 95th percentile is only ${pct(f.lineAP95AboveMedian)} above the median (saturation index ${f.lineASaturation.toFixed(2)}). A proxy only: the data has no capacity or onboard counts.`,
    },
    {
      url: `/calendar?date=${f.topSpike.date}`,
      title: "Days that broke the pattern",
      anchor: "The day against its expected hours",
      caption: `${formatDate(f.topSpike.date)} was ${signed(f.topSpike.value)} above comparable days. Likely driver (hypothesis): ${f.topSpike.label}.`,
    },
    {
      url: `/calendar?date=${f.topDip.date}`,
      title: "The deepest dips",
      anchor: "The day against its expected hours",
      caption: `${formatDate(f.topDip.date)}: ${signed(f.topDip.value)} against comparable days. Likely driver (hypothesis): ${f.topDip.label}. All three 2026 election Sundays are the lowest days of the year.`,
    },
    {
      url: "/calendar?year=2026&day=weekday",
      title: "Like for like",
      anchor: "Like-for-like trend",
      caption: `Comparing January–July only, because October–December 2025 is missing: 2026 runs ${formatPercent(f.growth2026, { signed: true })} against 2025, after 2025 grew ${formatPercent(f.growth2025, { signed: true })} on 2024.`,
    },
    {
      url: "/access?station=poblado",
      title: "Fifteen minutes on foot",
      caption: `Walking areas follow the actual streets. From Poblado you can reach ${f.pobladoArea15.toFixed(1)} km² in 15 minutes.`,
    },
    {
      url: "/access?mode=coverage&overlap=1",
      title: "How much of the city is in reach",
      caption: `${formatPercent(f.urbanShare15, { digits: 0 })} of Medellín's urban area is within a 15-minute walk of a station, and ${f.barriosFully} of ${f.barriosTotal} neighbourhoods are fully covered. This is access, not demand: ridership is recorded per line.`,
    },
  ];
}
