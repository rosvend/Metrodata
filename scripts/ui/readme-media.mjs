// README screenshots and GIFs (Spanish, light theme): node scripts/ui/readme-media.mjs [baseUrl] [outDir]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "docs/img";
const viewport = { width: 1440, height: 900 };
const browser = await chromium.launch({
  channel: "chrome",
  args: ["--ignore-gpu-blocklist", "--use-angle=vulkan", "--enable-features=Vulkan"],
});

const shots = [
  ["flow", "/?year=2026&day=weekday&hour=17"],
  ["peaks", "/peaks?year=2026&day=weekday"],
  ["calendar", "/calendar?year=2026&day=weekday"],
  ["access", "/access?mode=coverage&overlap=1"],
];
const page = await browser.newPage({ viewport, colorScheme: "light" });
await page.addInitScript(() => localStorage.setItem("lang", "es"));
for (const [name, url] of shots) {
  await page.goto(base + url);
  await page.locator("main").waitFor();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${out}/${name}.png` });
}
await page.close();

// Records a clip and converts it to a palette-optimised GIF with ffmpeg
async function gif(name, url, seconds, act = async () => {}) {
  const dir = mkdtempSync(join(tmpdir(), "metro-gif-"));
  const ctx = await browser.newContext({ viewport, colorScheme: "light", recordVideo: { dir, size: viewport } });
  await ctx.addInitScript(() => localStorage.setItem("lang", "es"));
  const p = await ctx.newPage();
  const start = Date.now();
  await p.goto(base + url);
  await p.locator("main").waitFor();
  await act(p);
  await p.waitForTimeout(seconds * 1000);
  const skip = Math.max(0, (Date.now() - start) / 1000 - seconds + 1);
  await ctx.close();
  const video = join(dir, readdirSync(dir)[0]);
  const filter =
    "fps=10,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer";
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-ss",
    String(skip),
    "-i",
    video,
    "-vf",
    filter,
    `${out}/${name}.gif`,
  ]);
  rmSync(dir, { recursive: true });
}
await gif("flow", "/?year=2026&day=weekday&hour=4&play=1", 14, (p) => p.getByText("4×", { exact: true }).click());
await gif("access", "/access?station=poblado", 6);
await browser.close();
console.log(`wrote ${shots.length} screenshots and 2 GIFs to ${out}`);
