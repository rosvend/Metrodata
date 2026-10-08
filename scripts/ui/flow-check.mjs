// Flow page check: initial view, selected line, hover tooltip, playback fps: node scripts/ui/flow-check.mjs [baseUrl] [outDir]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5173";
const out = process.argv[3] ?? ".cache/shots";
const browser = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--use-angle=vulkan", "--enable-features=Vulkan"],
});
const errors = [];
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
  await page.addInitScript((l) => localStorage.setItem("lang", l), "en");
  page.on("console", (m) => m.type() === "error" && errors.push(`${theme}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${theme}: ${e.message}`));
  await page.goto(base + "/?year=2026&day=weekday");
  await page.locator("canvas").first().waitFor();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${out}/flowmap-${theme}.png` });
  await page.getByRole("button", { name: /^Line A,/ }).click();
  await page.waitForTimeout(800);
  const box = await page.locator("section[aria-label='Flow map'] canvas").first().boundingBox();
  if (box) {
    const y = box.y + box.height * 0.62;
    for (let x = box.x + box.width * 0.3; x < box.x + box.width * 0.6; x += 6) {
      await page.mouse.move(x, y);
      if (
        await page
          .getByText(/boardings$/)
          .first()
          .isVisible()
          .catch(() => false)
      )
        break;
    }
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/flowmap-selected-${theme}.png` });
  if (theme === "light") {
    await page.getByRole("button", { name: "Play the day" }).click();
    const fps = await page.evaluate(
      () =>
        new Promise((res) => {
          let n = 0;
          let start = performance.now() + 1000;
          const tick = (now) => (now - start < 6000 ? (n++, requestAnimationFrame(tick)) : res(n / 6));
          setTimeout(() => requestAnimationFrame(tick), 1000);
        }),
    );
    console.log(`playback fps (Chrome on the real GPU, 6 s after 1 s warm-up): ${fps.toFixed(1)}`);
    await page.screenshot({ path: `${out}/flowmap-playing.png` });
    await page.getByRole("button", { name: "Pause the day" }).click();
    await page.getByRole("button", { name: "Close line details" }).click();
    for (const label of ["Per km", "Share of day"]) {
      await page.getByText(label, { exact: true }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/flowmap-${label.replace(/ /g, "-").toLowerCase()}.png` });
    }
    await page.getByRole("checkbox", { name: "Feeder bus routes" }).check();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/flowmap-feeders.png` });
  }
  await page.close();
}
const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await phone.addInitScript((l) => localStorage.setItem("lang", l), "en");
await phone.goto(base + "/");
await phone.locator("canvas").first().waitFor();
await phone.waitForTimeout(3000);
await phone.screenshot({ path: `${out}/flowmap-phone.png`, fullPage: true });
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
console.log("phone horizontal overflow:", overflow);
await browser.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
