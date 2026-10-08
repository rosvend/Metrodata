// Walk the guided demo with the keyboard, screenshot each step: node scripts/ui/demo-check.mjs [baseUrl] [outDir]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5173";
const out = process.argv[3] ?? ".cache/shots";
const lang = process.argv[4] ?? "en";
const b = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--use-angle=vulkan", "--enable-features=Vulkan"],
});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript((l) => localStorage.setItem("lang", l), lang);
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(base + "/peaks");
await p.locator("h1").first().waitFor();
await p.getByRole("button", { name: "Demo", exact: true }).click();
const bar = p.locator("section[aria-label='Guided demo'], section[aria-label='Demo guiada']");
for (let i = 1; i <= 10; i++) {
  await bar.getByText(lang === "es" ? `Paso ${i} de 10` : `Step ${i} of 10`).waitFor();
  await p.waitForTimeout(2200);
  const title = await bar.locator("h2").innerText();
  const caption = await bar.locator("p").nth(1).innerText();
  console.log(`${i}. ${new URL(p.url()).pathname}${new URL(p.url()).search}\n   ${title}: ${caption}`);
  await p.screenshot({ path: `${out}/demo-${String(i).padStart(2, "0")}.png` });
  if (i < 10) await p.keyboard.press("ArrowRight");
}
await p.keyboard.press("Escape");
await p.waitForTimeout(500);
console.log("bar closed after Esc:", (await bar.count()) === 0);
await b.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
