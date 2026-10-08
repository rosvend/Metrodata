export interface PageDef {
  path: string;
  label: string;
  title: string;
  lede: string;
}

export const PAGES: PageDef[] = [
  {
    path: "/",
    label: "Flow",
    title: "Where the boardings are",
    lede: "Boardings on each line, hour by hour. Play the day to watch the network fill and empty.",
  },
  {
    path: "/peaks",
    label: "Peaks",
    title: "When the network strains",
    lede: "Peak hours, how sharp they are, and which lines reach the same ceiling day after day.",
  },
  {
    path: "/calendar",
    label: "Calendar",
    title: "Days that broke the pattern",
    lede: "Every day compared with similar days around it, to surface spikes and dips.",
  },
  {
    path: "/access",
    label: "Access",
    title: "Fifteen minutes on foot",
    lede: "Walking areas around every station, computed on the street network.",
  },
];
