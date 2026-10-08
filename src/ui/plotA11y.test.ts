import { expect, it } from "vitest";
import { tidyPlotAria } from "./plotA11y";

it("turns a labelled chart into one image and strips inner mark labels", () => {
  const host = document.createElement("div");
  host.innerHTML = `<svg aria-label="Heatmap"><g aria-label="cell"><rect/></g><g aria-label="tip"/></svg><svg><g aria-label="tick"/></svg>`;
  tidyPlotAria(host);
  const [chart, legend] = host.querySelectorAll("svg");
  expect(chart?.getAttribute("role")).toBe("img");
  expect(host.querySelectorAll("g[aria-label]")).toHaveLength(0);
  expect(legend?.getAttribute("aria-hidden")).toBe("true");
  expect(chart?.querySelector("g.plot-tip")).not.toBeNull();
});
