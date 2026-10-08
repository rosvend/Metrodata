// Cold-load timing per page (time until its main content is visible): node scripts/ui/perf-check.mjs [baseUrl]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:4173";
const PAGES = [
  ["/", "button[aria-label^='Line A,']"],
  ["/peaks", "section[aria-label='Line × hour'] svg"],
  ["/calendar", "section[aria-label$='day by day'] svg"],
  ["/access", "section[aria-label='Access map'] canvas"],
];
const b = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--use-angle=vulkan", "--enable-features=Vulkan"],
});
for (const throttle of [1, 4]) {
  for (const [path, selector] of PAGES) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
    const t0 = Date.now();
    await page.goto(base + path);
    await page.locator(selector).first().waitFor({ timeout: 60000 });
    const ms = Date.now() - t0;
    const fcp = await page.evaluate(() => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0);
    console.log(`${throttle}x CPU ${path.padEnd(10)} content ${String(ms).padStart(5)} ms  FCP ${Math.round(fcp)} ms`);
    await ctx.close();
  }
}
await b.close();
