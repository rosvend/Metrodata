// Screenshot every page in light/dark at desktop and phone widths: node scripts/ui/screenshots.mjs [baseUrl] [outDir]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5173";
const out = process.argv[3] ?? ".cache/shots";
const lang = process.argv[4] ?? "es";
const pages = ["/", "/peaks", "/calendar", "/access"];
const viewports = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
for (const theme of ["light", "dark"]) {
  for (const [name, viewport] of Object.entries(viewports)) {
    const ctx = await browser.newContext({ viewport, colorScheme: theme });
    await ctx.addInitScript((l) => localStorage.setItem("lang", l), lang);
    const page = await ctx.newPage();
    page.on("console", (m) => m.type() === "error" && errors.push(`${theme}/${name}: ${m.text()}`));
    page.on("pageerror", (e) => errors.push(`${theme}/${name}: ${e.message}`));
    for (const path of pages) {
      await page.goto(base + path);
      await page.locator("h1").first().waitFor();
      await page.waitForTimeout(400);
      const slug = path === "/" ? "flow" : path.slice(1);
      await page.screenshot({ path: `${out}/${slug}-${name}-${theme}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) errors.push(`${theme}/${name}${path}: horizontal overflow`);
      if (name === "desktop" && theme === "light") {
        const fit = await page.evaluate(() => {
          const m = document.querySelector("main");
          return m ? m.scrollHeight - m.clientHeight : 0;
        });
        console.log(`${path}: ${fit > 0 ? `needs ${fit}px of scrolling` : "fits in one view"} at 1440x900`);
      }
    }
    await page.goto(base + "/");
    await page.locator("h1").first().waitFor();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.screenshot({ path: `${out}/focus-${name}-${theme}.png` });
    await page
      .locator("header button")
      .filter({ hasText: /About|Datos|Sobre/ })
      .first()
      .click();
    await page.locator("dialog[open] ul >> nth=1").locator("li").nth(3).waitFor();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}/about-${name}-${theme}.png` });
    await ctx.close();
  }
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "no console errors, no horizontal overflow");
