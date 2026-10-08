// Calendar page check: deep link, list click updates URL, hover tip: node scripts/ui/calendar-check.mjs [baseUrl] [outDir]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5173";
const out = process.argv[3] ?? ".cache/shots";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(`${base}/calendar?date=2024-12-22`);
await p.getByText("Sun 22 Dec 2024").first().waitFor();
console.log("deep link: year filter =", await p.getByRole("radio", { name: "2024", exact: true }).isChecked());
console.log(
  "deep link detail:",
  (await p.locator("section[aria-label='The day against its expected hours']").innerText())
    .split("\n")
    .slice(1, 5)
    .join(" | "),
);
await p.screenshot({ path: `${out}/calendar-2024.png` });
await p.getByRole("button", { name: /Sun 15 Dec 2024/ }).click();
console.log("after list click URL:", new URL(p.url()).search);
const svg = p.locator("section[aria-label='2024, day by day'] svg").first();
const box = await svg.boundingBox();
if (box) await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.6);
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/calendar-hover.png` });
console.log(
  "hover tip:",
  (await p
    .locator(
      "section[aria-label='2024, day by day'] .plot-tip, section[aria-label='2024, day by day'] g[aria-label='tip']",
    )
    .count()) > 0,
);
await p.getByText("By hour", { exact: true }).click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/calendar-hourly.png` });
await b.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
