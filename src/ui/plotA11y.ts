// Plot labels its inner <g> marks ("cell", "line"), which is noise for screen readers and invalid ARIA.
// Each labelled chart becomes one image with its description; unlabelled legend ramps are hidden.
export function tidyPlotAria(root: Element): void {
  const svgs = root.tagName.toLowerCase() === "svg" ? [root] : [...root.querySelectorAll("svg")];
  for (const svg of svgs) {
    for (const g of svg.querySelectorAll('g[aria-label="tip"]')) g.classList.add("plot-tip");
    for (const g of svg.querySelectorAll("g[aria-label]")) g.removeAttribute("aria-label");
    for (const g of svg.querySelectorAll("g[aria-description]")) g.removeAttribute("aria-description");
    if (svg.getAttribute("aria-label")) svg.setAttribute("role", "img");
    else svg.setAttribute("aria-hidden", "true");
  }
}
