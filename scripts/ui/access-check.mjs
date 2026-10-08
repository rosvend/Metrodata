// Access page check: station deep link, growth animation, click-anywhere, coverage + neighbourhoods
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5173";
const out = process.argv[3] ?? ".cache/shots";
const b = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--use-angle=vulkan", "--enable-features=Vulkan"],
});
const errors = [];
for (const theme of ["light", "dark"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
  await p.addInitScript((l) => localStorage.setItem("lang", l), "en");
  p.on("pageerror", (e) => errors.push(`${theme}: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errors.push(`${theme}: ${m.text()}`));
  await p.goto(`${base}/access?station=poblado`);
  await p.getByRole("heading", { name: "Poblado" }).waitFor();
  await p.waitForTimeout(450);
  if (theme === "light") await p.screenshot({ path: `${out}/access-growing.png` });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}/access-station-${theme}.png` });
  if (theme === "dark") continue;
  console.log(
    "station panel:",
    (await p.locator("aside[aria-label='Details']").innerText()).split("\n").slice(0, 12).join(" | "),
  );
  const map = await p.locator("section[aria-label='Access map'] canvas").first().boundingBox();
  if (map) await p.mouse.click(map.x + map.width * 0.42, map.y + map.height * 0.45);
  await p.getByRole("status").filter({ hasText: "precomputed" }).waitFor();
  console.log(
    "point result:",
    (await p.getByRole("status").filter({ hasText: "precomputed" }).innerText()).split("\n")[0],
  );
  await p.screenshot({ path: `${out}/access-point.png` });
  await p.getByText("Coverage", { exact: true }).click();
  await p.getByText("Show overlap").click();
  await p
    .getByRole("button", { name: /^Prado/ })
    .first()
    .click();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/access-coverage.png` });
  await p.getByText("Metrocable", { exact: true }).click();
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/access-coverage-cable.png` });
  const fit = await p.evaluate(
    () => document.querySelector("main")?.scrollHeight - document.querySelector("main")?.clientHeight,
  );
  console.log("needs scrolling:", fit, "px");
  await p.close();
}
await b.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
