import type { Messages } from "../i18n/en";
import type { Lang } from "../i18n/lang";
import type { DemoFacts, Extreme } from "./facts";

export interface DemoStep {
  url: string;
  title: string;
  caption: string;
  // Card to scroll into view when the page is taller than the screen
  anchor?: string;
}

// Where each tour step goes; titles and narration come from the dictionaries (t.tour), in the same order
function places(f: DemoFacts, t: Messages): { url: string; anchor?: string }[] {
  const c = t.calendar;
  return [
    { url: "/?year=2026&day=weekday&hour=17" },
    { url: "/?year=2026&day=weekday&metric=share&hour=4&play=1" },
    { url: "/?year=2026&day=weekday&line=A&hour=17" },
    { url: "/peaks?year=2026&day=weekday", anchor: t.peaks.heatTitle },
    { url: "/peaks?year=2026&day=weekday", anchor: t.peaks.satTitle },
    { url: `/calendar?date=${f.topSpike.date}`, anchor: c.dayTitle },
    { url: `/calendar?date=${f.topDip.date}`, anchor: c.dayTitle },
    { url: "/calendar?year=2026&day=weekday", anchor: c.trendTitle },
    { url: "/access?station=poblado" },
    { url: "/access?mode=coverage&overlap=1" },
  ];
}

const driverLabel = (e: Extreme, t: Messages, lang: Lang) =>
  e.driver === "holiday"
    ? t.calendar.holidayDriver((lang === "es" ? e.holiday_es : e.holiday) ?? "")
    : (t.calendar.drivers[e.driver] ?? e.driver);

// The guided tour in the selected language; every number is read from the facts
export function demoSteps(f: DemoFacts, t: Messages, lang: Lang): DemoStep[] {
  // Captions read the driver field, so swap the key for its translated label
  const named: DemoFacts = {
    ...f,
    topSpike: { ...f.topSpike, driver: driverLabel(f.topSpike, t, lang) },
    topDip: { ...f.topDip, driver: driverLabel(f.topDip, t, lang) },
  };
  return places(f, t).map((place, i) => {
    const copy = t.tour[i];
    if (!copy) throw new Error(`Tour step ${i + 1} has no text`);
    return { ...place, title: copy.title, caption: copy.caption(named) };
  });
}
