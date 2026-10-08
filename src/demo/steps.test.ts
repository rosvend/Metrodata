import { expect, it } from "vitest";
import type { DemoFacts } from "./facts";
import { demoSteps } from "./steps";

const facts: DemoFacts = {
  lineAShare: 0.6488,
  lineAWeekday: 683405,
  lineAPeakHour: 17,
  lineAPeakShare: 0.1119,
  lineASaturation: 1.056,
  lineAP95AboveMedian: 0.056,
  systemPeakHour: 17,
  systemPeakShare: 0.1023,
  cablePeakHour: 5,
  arviPeakToAverage: 1.12,
  topSpike: { date: "2024-12-22", value: 35.06, label: "Christmas lights" },
  topDip: { date: "2026-06-21", value: -64.81, label: "Election day" },
  growth2026: -0.0404,
  growth2025: 0.0222,
  pobladoArea15: 2.7,
  urbanShare15: 0.4847,
  barriosFully: 90,
  barriosTotal: 269,
};

it("walks the four pages in order with data-driven captions", () => {
  const steps = demoSteps(facts);
  const pages = steps.map((s) => s.url.split("?")[0]);
  expect(pages[0]).toBe("/");
  expect(pages.at(-1)).toBe("/access");
  expect(new Set(pages)).toEqual(new Set(["/", "/peaks", "/calendar", "/access"]));
  expect(steps[0]?.caption).toContain("64.9%");
  expect(steps[5]?.caption).toContain("Sun 22 Dec 2024");
  expect(steps[5]?.caption).toContain("+35.1%");
  expect(steps[6]?.caption).toContain("−64.8%");
  expect(steps[7]?.caption).toContain("−4.0%");
  expect(steps[9]?.caption).toContain("90 of 269");
  expect(steps[9]?.caption).toContain("48% of Medellín");
});

it("labels every driver as a hypothesis", () => {
  for (const s of demoSteps(facts).filter((s) => s.caption.includes("driver")))
    expect(s.caption).toContain("(hypothesis)");
});
