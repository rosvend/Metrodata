import type { SpikesJson } from "../data/types";
import type { Messages } from "../i18n/en";
import type { Lang } from "../i18n/lang";

// Holiday names and driver hypotheses are stored as keys/both languages in the data; pick the right one here
export function holidayName(spikes: SpikesJson, i: number, lang: Lang): string | null {
  return (lang === "es" ? spikes.holiday_es[i] : spikes.holiday[i]) ?? null;
}

export function driverText(t: Messages, spikes: SpikesJson, i: number, lang: Lang): string {
  const key = spikes.driver[i] ?? "none";
  if (key === "holiday") return t.calendar.holidayDriver(holidayName(spikes, i, lang) ?? "");
  return t.calendar.drivers[key] ?? t.calendar.drivers.none ?? key;
}
