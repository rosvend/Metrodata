// Automated accessibility scan (axe-core, WCAG 2.1 AA) of every page in both themes: node scripts/ui/a11y-check.mjs [baseUrl]
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:4173";
const PAGES = ["/", "/peaks", "/calendar", "/access?station=poblado"];
const b = await chromium.launch({ channel: "chrome" });
let total = 0;
for (const [theme, lang] of [
  ["light", "es"],
  ["dark", "es"],
  ["light", "en"],
  ["dark", "en"],
]) {
  for (const path of [...PAGES, "about"]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
    await ctx.addInitScript((l) => localStorage.setItem("lang", l), lang);
    const page = await ctx.newPage();
    await page.goto(base + (path === "about" ? "/peaks" : path));
    await page.locator("h1").first().waitFor();
    await page.waitForTimeout(2500);
    if (path === "about") {
      await page
        .locator("header button")
        .filter({ hasText: /About|Datos|Sobre/ })
        .first()
        .click();
      await page.locator("dialog[open] ul >> nth=1").locator("li").nth(3).waitFor();
    }
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    for (const v of res.violations) {
      total += v.nodes.length;
      console.log(`${theme}/${lang} ${path}: [${v.impact}] ${v.id} (${v.nodes.length}): ${v.help}`);
      for (const n of v.nodes.slice(0, 3))
        console.log(`    ${n.target.join(" ")} ${n.failureSummary?.split("\n")[1] ?? ""}`);
    }
    await ctx.close();
  }
}
await b.close();
console.log(total ? `${total} issues` : "no axe violations");
