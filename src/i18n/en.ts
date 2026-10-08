import type { DemoFacts } from "../demo/facts";
import { formatDate, formatDecimal, formatInt, formatPercent } from "../lib/format";

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const signed = (v: number) => formatPercent(v / 100, { signed: true });

// English copy. es.ts must provide the same shape (checked by TypeScript)
export const en = {
  locale: "en-US",
  common: {
    loading: "Loading data",
    whatIs: (label: string) => `What is ${label}?`,
    close: "Close",
    retry: "Retry",
    loadError: "This view's data didn't load.",
    loadErrorHint: (message: string) => `${message}. Run \`npm run data\` if the files are missing, then retry.`,
    mapError: (message: string) => `The map could not be drawn: ${message}`,
    boardings: "boardings",
  },
  shell: {
    home: "Metrodata home",
    tagline: "Ridership intelligence",
    skip: "Skip to content",
    pagesNav: "Pages",
    demo: "Demo",
    endDemo: "End demo",
    about: "About",
    aboutLong: "About the data",
    theme: (next: "light" | "dark") => `Switch to ${next === "dark" ? "dark" : "light"} theme`,
    language: "Idioma / Language",
  },
  pages: {
    "/": {
      label: "Flow",
      title: "Where the boardings are",
      lede: "Boardings on each line, hour by hour. Play the day to watch the network fill and empty.",
    },
    "/peaks": {
      label: "Peaks",
      title: "When the network strains",
      lede: "Peak hours, how sharp they are, and which lines reach the same ceiling day after day.",
    },
    "/calendar": {
      label: "Calendar",
      title: "Days that broke the pattern",
      lede: "Every day compared with similar days around it, to surface spikes and dips.",
    },
    "/access": {
      label: "Access",
      title: "Fifteen minutes on foot",
      lede: "Walking areas around every station, computed on the street network.",
    },
  },
  notFound: {
    title: "No station here",
    lede: "This address doesn't match any page of the dashboard.",
    link: "Go to the flow map",
  },
  filters: {
    year: "Year",
    days: "Days",
    yearHint: (y: number, coverage: string) => `${y}: data for ${coverage}`,
    coverage: { 2024: "Jan–Dec", 2025: "Jan–Sep", 2026: "Jan–Jul" },
    dayShort: { weekday: "Weekday", saturday: "Sat", sunday_holiday: "Sun & hol." },
    dayPlural: { weekday: "Weekdays", saturday: "Saturdays", sunday_holiday: "Sundays & holidays" },
    daySingular: { weekday: "weekday", saturday: "Saturday", sunday_holiday: "Sunday or holiday" },
  },
  about: {
    title: "About the data",
    intro:
      "Hourly boardings for the 12 lines of the Metro de Medellín system, with station locations and line shapes from the system's open data.",
    limitsTitle: "What you can and can't read here",
    limits: [
      "Ridership is counted per line, per day and per hour. There is no station-level or origin–destination data, so the maps show line-level volumes only.",
      "Figures are boardings, not passengers: someone who transfers is counted once on each line they board.",
      "Bottleneck measures (peak concentration, load per km, saturation index) are proxies. The data has no onboard load, capacity or headways.",
      "Reasons given for spikes and dips (Christmas lights, Feria de las Flores, long weekends, elections) are hypotheses, not proven causes.",
      "Data covers January 2024 to July 2026, but October–December 2025 does not exist. Year-over-year comparisons therefore use January–July only.",
      "Lines 1, 2 and O are bus corridors; their lengths, and per-km figures, are indicative. The Línea O shape is the planned Corredor de la 80.",
    ],
    checksTitle: "Data checks",
    loadingChecks: "Loading data checks",
    reconciled: (ok: boolean, mismatches: number) =>
      `${ok ? "2026 totals match the source file's grand total" : "2026 totals do NOT match the source"}; every row's hours add up to its daily total (${mismatches} mismatches).`,
    excluded: (date: string, boardings: string) =>
      `${date} is excluded from all measures: only ${boardings} boardings were recorded (probable logging failure; about 700,000 were expected).`,
    missing: (dates: string) => `Missing from the source and not filled in: ${dates}.`,
    closures: "Days a line did not run are treated as closures, never as zero boardings.",
    noBaseline: (n: number) => `${n} days have too few comparable days to compute a spike index and are left blank.`,
    walking: (ok: number, total: number, date: string, version: string, speed: number) =>
      `Walking areas: ${ok} of ${total} stations, OpenStreetMap data from ${date}, Valhalla ${version} at ${speed} km/h.`,
  },
  kpi: {
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
  },
  flow: {
    loading: "Loading the network",
    mapLabel: "Flow map",
    play: "Play the day",
    pause: "Pause the day",
    hourOfOperation: "Hour of operation",
    hourOfDay: "Hour of day",
    speed: "Speed",
    widthShows: "Width shows",
    feeders: "Feeder bus routes",
    loadingFeeders: "Loading feeder routes…",
    metrics: { boardings: "Boardings", per_km: "Per km", share: "Share of day" },
    metricSentence: {
      boardings: "boardings per hour",
      per_km: "boardings per hour per km of line",
      share: "each line's share of its own daily boardings",
    },
    value: {
      boardings: (v: string) => `${v} boardings`,
      per_km: (v: string) => `${v} boardings per km`,
      share: (v: string) => `${v} of the line's daily boardings`,
    },
    context: (daySingular: string, year: number) => `average ${daySingular}, ${year}`,
    legendItem: (badge: string, mode: string, value: string) => `Line ${badge}, ${mode}: ${value}. Show details`,
    linesLabel: "Lines",
    readMap: "this map",
    howToRead: (metric: string, context: string, coverage: string) =>
      `Line width and brightness show ${metric}, ${context} (${coverage}). Moving dots are proportional to that value; they are not vehicles. Ridership is recorded per line, so stations show location only. Dashed: Línea O planned alignment (indicative). Grey dashed: Cable Palmitas, no data. Shaded: outside the Valle de Aburrá metro area.`,
    tipPlanned: "Shape and length are indicative: the source draws the planned Corredor de la 80.",
    tipNoData: "No ridership data for this line.",
    tipLines: (lines: string) => `Lines ${lines}`,
    tipStation: "Ridership is recorded per line, not per station.",
    panel: {
      details: (badge: string) => `Line ${badge} details`,
      closeDetails: "Close line details",
      indicative: " (indicative)",
      profileTitle: (dayPlural: string, year: number) => `Average hourly boardings, ${dayPlural} ${year}`,
      coverageNote: (year: number, coverage: string, band: string) =>
        `${year} data covers ${coverage}. Marker: ${band}.`,
      profileLabel: (badge: string) => `Hourly boardings profile for line ${badge}`,
      yAxis: "boardings / hour",
      daily: (n: string, daySingular: string) => `${n} boardings on an average ${daySingular}.`,
      indicatorsTitle: (year: number) => `Weekday indicators, ${year}`,
      weekdayBoardings: "Weekday boardings",
      share: "Share of all lines",
      peakHour: "Peak hour",
      peakToAverage: "Peak ÷ average hour",
      loadPerKm: "Peak-hour boardings per km",
      saturation: "Saturation index (proxy)",
      saturday: "Saturday ÷ weekday",
      sunday: "Sunday & holiday ÷ weekday",
      indicativeNote: "* Line length is indicative for bus corridors.",
    },
  },
  peaks: {
    loading: "Loading peak data",
    coverageNote: (year: number, coverage: string) => `${year} covers ${coverage}. Boardings, not passengers.`,
    weekdaysOnly: " Weekdays only, by definition.",
    noData: "No data for this selection.",
    heatTitle: "Line × hour",
    heatSubtitle: (dayPlural: string, year: number) => `Average ${dayPlural}, ${year}`,
    heatInfo:
      "Each cell is the mean boardings in that hour band over the operating days of the selected day type. Share mode divides by the line's own daily total, so lines of very different size can be compared.",
    colorShows: "Color shows",
    shareOfDay: "Share of day",
    boardings: "Boardings",
    heatLabel: (share: boolean) => `Heatmap of ${share ? "share of daily boardings" : "boardings"} by line and hour`,
    heatTip: (badge: string, band: string, boardings: string) => `Line ${badge}, ${band}\n${boardings} boardings`,
    heatTipShare: (share: string) => `\n${share} of the line's day`,
    profileTitle: "System profile by day type",
    profileSubtitle: (year: number) => `All lines, average boardings per hour, ${year}`,
    profileLabel: "System boardings per hour by day type",
    perHour: "Boardings per hour",
    profileTip: (day: string, band: string, boardings: string) => `${day}, ${band}\n${boardings} boardings (average)`,
    legend: "Legend",
    tableTitle: "Peaks by line",
    tableSubtitle: (dayPlural: string, year: number) => `${dayPlural}, ${year}. Click a column to sort.`,
    colLine: "Line",
    colPeakHour: "Peak hour",
    colPeakShare: "Peak share",
    colRatio: "Peak ÷ avg",
    colDay: "Day",
    system: "System",
    lineSr: "Line ",
    loadTitle: "Peak-hour load per km",
    loadSubtitle: (year: number) => `Peak-hour boardings ÷ km, median weekday, ${year}.`,
    loadLabel: "Median weekday peak-hour boardings per km, by line",
    loadTip: (badge: string, value: string, indicative: boolean) =>
      `Line ${badge}: ${value} boardings per km in the peak hour${indicative ? " (length indicative)" : ""}`,
    hollowNote: "* Hollow: bus corridor, length indicative.",
    satTitle: "Saturation (proxy)",
    satSubtitle: "Boardings in each weekday's busiest hour, one dot per day. Solid: median, dashed: P95.",
    satPicker: "Line for the saturation view",
    satButton: (badge: string, si: string) => `Line ${badge}, saturation index ${si}`,
    satLabel: (badge: string) => `Distribution of weekday peak-hour boardings for line ${badge} by year`,
    satTip: (date: string, boardings: string, hour: number) => `${date}: ${boardings} boardings at ${hour}:00`,
  },
  calendar: {
    loading: "Loading the calendar",
    coreNote:
      "Core lines A, B, T-A, 1, 2, O and P. Each day is compared with the same weekday and day type within ±35 days.",
    yearTitle: (year: number) => `${year}, day by day`,
    yearSubtitle: (coverage: string) =>
      `Data covers ${coverage}. Click a day to see its hours. All day types are shown: each is compared only with its own kind.`,
    info: "Deviation = core-line boardings ÷ expected − 1. Expected is the median of the same weekday and day type within ±35 days, excluding the day itself. Grey outline: too few comparable days (left blank). Dashed red: excluded day (probable logging failure). Empty: no data in the source.",
    legendLow: "−40% or less",
    legendHigh: "+40% or more",
    legendLabel: "Color legend",
    heatLabel: "Calendar of daily deviation from expected boardings",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    tipMissing: "No data in the source",
    tipExcluded: "Excluded: probable logging failure",
    tipCore: (n: string) => `Core lines: ${n} boardings`,
    tipAll: (n: string) => `All lines: ${n} boardings`,
    tipExpected: (n: string) => `Expected: ${n}`,
    tipDeviation: (v: string) => `Deviation: ${v}`,
    tipNoBaseline: "Too few comparable days for an expected value",
    tipHoliday: (name: string) => `Holiday: ${name}`,
    tipDriver: (label: string) => `Likely driver (hypothesis): ${label}`,
    rankedTitle: "Biggest spikes and dips",
    rankedSubtitle: (year: number) => `${year}. Drivers are hypotheses to verify, not causes.`,
    above: "Highest above expected",
    below: "Furthest below expected",
    hypothesis: "(hypothesis)",
    dayTitle: "The day against its expected hours",
    goToDate: "Go to date",
    pickDay: "Pick a day in the calendar or the list.",
    noCoreData: (date: string) => `No core-line data for ${date}.`,
    versusExpected: (actual: string, expected: string | null) => `${actual} vs ${expected ?? "no"} expected`,
    dayLabel: (date: string) => `Hourly boardings on ${date} compared with the expected profile`,
    tipActual: (n: string) => `Actual: ${n}`,
    dayNote: (n: number, window: number, lines: string) =>
      `Solid: this day. Dashed: median of ${n} comparable days (same weekday and day type, ±${window} days). Core lines ${lines}.`,
    trendTitle: "Like-for-like trend",
    lflNote: "Like-for-like: January–July only, because October–December 2025 is missing and 2026 ends in July.",
    view: "View",
    byMonth: "By month",
    byHour: "By hour",
    lflHeadline: "Mean daily boardings, Jan–Jul:",
    lflPair: (y: string, vs: number, g: string) => `${y} vs ${vs} ${g}`,
    monthlyLabel: "Mean daily boardings per month, January to July, by year",
    monthlyAxis: "Mean daily boardings",
    monthlyTip: (month: string, year: number, v: string) => `${month} ${year}: ${v} boardings per day`,
    hourlyNote: (dayPlural: string) =>
      `${dayPlural}, average boardings per hour band, 2026 vs 2025. After 22:00 the base is tiny, so percentages swing widely.`,
    hourlyLabel: "Change in boardings per hour band, January to July 2026 versus 2025",
    hourlyAxis: "2026 vs 2025",
    drivers: {
      election: "Election day",
      holiday: "Public holiday",
      feria: "Feria de las Flores",
      christmas: "Christmas lights",
      christmas_eve: "Christmas Eve",
      new_years_eve: "New Year's Eve",
      new_year: "New Year period",
      holy_week: "Holy Week",
      long_weekend: "Long weekend",
      none: "No obvious driver",
    } as Record<string, string>,
    holidayDriver: (name: string) => `Public holiday: ${name}`,
  },
  access: {
    loading: "Loading walking areas",
    mapLabel: "Access map",
    method:
      "Walking areas were computed offline with Valhalla on OpenStreetMap streets at 4.8 km/h, for the 50 main stations (Metro, Tranvía, Metrocable and the main Metroplús stations). They follow streets and paths, not straight lines.",
    methodLabel: "how walking areas were computed",
    show: "Show",
    oneStation: "One station",
    coverage: "Coverage",
    stations: "Stations",
    filters: { all: "All", metro: "Metro", tranvia: "Tranvía", metrocable: "Metrocable" },
    filterNames: {
      all: "all stations",
      metro: "Metro stations",
      tranvia: "Tranvía stations",
      metrocable: "Metrocable stations",
    },
    showOverlap: "Show overlap",
    findStation: "Find a station",
    findPlaceholder: "e.g. Poblado",
    clickHint: "Click anywhere on the map to check the walk.",
    details: "Details",
    pickTitle: "Pick a station",
    pickBody1:
      "Click a station on the map, or use Find a station, to see how far you can walk from it in 5, 10 and 15 minutes.",
    pickBody2: "Switch to Coverage to see the walking time to the nearest station across the city.",
    reachable: "Area reachable on foot",
    min: (m: number) => `${m} min`,
    overlapShare: (share: string) => `${share} of the 15-minute area is also within 15 minutes of another station.`,
    underOne: "Under 1%",
    nearest: "Nearest stations",
    straightLine: (d: string) => `${d} straight line`,
    overlap: ", walking areas overlap",
    touch: ", walking areas just touch",
    snapNote: (m: string) =>
      `Contours start from the street point nearest the station (${m} m away). Station entrances are not in the data, so edges are approximate by tens of metres.`,
    coverageTitle: "Walking time to the nearest station",
    using: (filter: string, n: number) => `Using ${filter} (${n}).`,
    band: (m: number) => (m === 5 ? "Up to 5 min" : `${m - 4}–${m} min`),
    within15: "Within 15 min",
    urbanShare: "Of Medellín's urban area",
    twice: "Covered twice or more",
    barriosTitle: (n: number, total: number) => `Neighbourhoods fully within 15 minutes: ${n} of ${total}`,
    barriosNote: (pct: string) =>
      `Medellín's urban neighbourhoods only (the data has none for other municipalities). Fully means at least ${pct} of the area.`,
    filterBarrios: "Filter neighbourhoods",
    findBarrio: "Find a neighbourhood",
    comuna: (n: number) => `Comuna ${n}`,
    noMatch: "No match.",
    within5: "Within 5 minutes",
    minutesRange: (m: number) => `${m - 4}–${m} minutes`,
    onFootTo: (name: string) => `on foot to ${name}.`,
    beyond: "More than 15 minutes on foot from any station shown.",
    clear: "Clear",
    pointNote: (lat: string, lon: string) =>
      `At ${lat}, ${lon}. Answered from the precomputed 5, 10 and 15-minute contours, so the resolution is 5-minute steps.`,
  },
  demo: {
    label: "Guided demo",
    step: (i: number, n: number) => `Step ${i} of ${n}`,
    back: "Back",
    next: "Next",
    finish: "Finish",
    end: "End demo",
    keys: "← and → to move, Esc to leave",
    failed: (message: string) => `The demo could not start: ${message}.`,
  },
  // Guided tour narration; every number comes from DemoFacts (computed from the data)
  tour: [
    {
      title: "The network at the evening peak",
      caption: (f: DemoFacts) =>
        `An average 2026 weekday at ${hh(f.systemPeakHour)}, the busiest hour (${formatPercent(f.systemPeakShare)} of the day's boardings). Line A alone carries ${formatPercent(f.lineAShare)} of weekday boardings.`,
    },
    {
      title: "Every line has its own day",
      caption: (f: DemoFacts) =>
        `Widths now show each line's share of its own day. Metrocable lines peak at ${hh(f.cablePeakHour)}, earlier than the rest of the network; the city-wide peak comes in the evening.`,
    },
    {
      title: "Line A in detail",
      caption: (f: DemoFacts) =>
        `${formatInt(f.lineAWeekday)} boardings on an average weekday, peaking at ${hh(f.lineAPeakHour)} with ${formatPercent(f.lineAPeakShare)} of the day. A passenger who changes lines is counted once on each line.`,
    },
    {
      title: "When the network strains",
      caption: (f: DemoFacts) =>
        `The heatmap shows each line's rhythm: cable lines are sharpest at dawn, while Arví (L) stays flat all day (peak ÷ average ${formatDecimal(f.arviPeakToAverage, 2)}).`,
    },
    {
      title: "A possible ceiling on Line A",
      caption: (f: DemoFacts) =>
        `Line A's busiest hour barely changes from one weekday to the next: the 95th percentile is only ${formatPercent(f.lineAP95AboveMedian)} above the median (saturation index ${formatDecimal(f.lineASaturation, 2)}). A proxy only: the data has no capacity or onboard counts.`,
    },
    {
      title: "Days that broke the pattern",
      caption: (f: DemoFacts) =>
        `${formatDate(f.topSpike.date)} was ${signed(f.topSpike.value)} above comparable days. Likely driver (hypothesis): ${f.topSpike.driver}.`,
    },
    {
      title: "The deepest dips",
      caption: (f: DemoFacts) =>
        `${formatDate(f.topDip.date)}: ${signed(f.topDip.value)} against comparable days. Likely driver (hypothesis): ${f.topDip.driver}. All three 2026 election Sundays are the lowest days of the year.`,
    },
    {
      title: "Like for like",
      caption: (f: DemoFacts) =>
        `Comparing January–July only, because October–December 2025 is missing: 2026 runs ${formatPercent(f.growth2026, { signed: true })} against 2025, after 2025 grew ${formatPercent(f.growth2025, { signed: true })} on 2024.`,
    },
    {
      title: "Fifteen minutes on foot",
      caption: (f: DemoFacts) =>
        `Walking areas follow the actual streets. From Poblado you can reach ${formatDecimal(f.pobladoArea15, 1)} km² in 15 minutes.`,
    },
    {
      title: "How much of the city is in reach",
      caption: (f: DemoFacts) =>
        `${formatPercent(f.urbanShare15, { digits: 0 })} of Medellín's urban area is within a 15-minute walk of a station, and ${f.barriosFully} of ${f.barriosTotal} neighbourhoods are fully covered. This is access, not demand: ridership is recorded per line.`,
    },
  ],
};

export type Messages = typeof en;
