import { expect, it } from "vitest";
import type { SpikesJson } from "../data/types";
import { en } from "../i18n/en";
import { es } from "../i18n/es";
import { driverText, holidayName } from "./labels";

const spikes = {
  driver: ["holiday", "christmas"],
  holiday: ["Independence Day", null],
  holiday_es: ["Día de la Independencia", null],
} as unknown as SpikesJson;

it("uses the holiday name in the selected language", () => {
  expect(holidayName(spikes, 0, "es")).toBe("Día de la Independencia");
  expect(driverText(en, spikes, 0, "en")).toBe("Public holiday: Independence Day");
  expect(driverText(es, spikes, 0, "es")).toBe("Festivo: Día de la Independencia");
});

it("translates driver keys", () => {
  expect(driverText(es, spikes, 1, "es")).toBe("Alumbrados navideños");
  expect(driverText(en, spikes, 1, "en")).toBe("Christmas lights");
});
