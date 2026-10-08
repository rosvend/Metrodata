import { expect, it } from "vitest";
import { en } from "./en";
import { es } from "./es";
import { resolveLang } from "./lang";

it("defaults to Spanish and accepts a stored choice", () => {
  expect(resolveLang(null)).toBe("es");
  expect(resolveLang("en")).toBe("en");
  expect(resolveLang("fr")).toBe("es");
});

it("translates every page and the whole tour", () => {
  expect(Object.keys(es.pages)).toEqual(Object.keys(en.pages));
  expect(es.tour).toHaveLength(en.tour.length);
  expect(Object.keys(es.calendar.drivers).sort()).toEqual(Object.keys(en.calendar.drivers).sort());
  expect(es.pages["/"].title).not.toBe(en.pages["/"].title);
});
