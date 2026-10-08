// Tab through each page and list what receives focus (and whether a focus ring is drawn)
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:5173";
const b = await chromium.launch({ channel: "chrome" });
for (const path of ["/", "/peaks", "/calendar", "/access"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(base + path);
  await p.locator("h1").first().waitFor();
  await p.waitForTimeout(1500);
  const seen = [];
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press("Tab");
    const info = await p.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const name =
        el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 28) || el.getAttribute("type") || el.tagName;
      const outline =
        getComputedStyle(el).outlineStyle !== "none" ||
        getComputedStyle(el.closest("label") ?? el).outlineStyle !== "none";
      return `${el.tagName.toLowerCase()}:${name}${outline ? "" : " (NO RING)"}`;
    });
    if (info) seen.push(info);
  }
  console.log(`${path}: ${seen.join(" → ")}\n`);
  await p.close();
}
await b.close();
